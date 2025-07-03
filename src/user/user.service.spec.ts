import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

jest.mock('bcrypt');

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};
const mockJwtService = {
  signAsync: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let prisma: typeof mockPrismaService;
  let jwt: typeof mockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
    jwt = module.get(JwtService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw if passwords do not match', async () => {
      await expect(
        service.register({
          email: 'a@a.com',
          password: '123456',
          repeatPassword: '654321',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if password is too short', async () => {
      await expect(
        service.register({
          email: 'a@a.com',
          password: '123',
          repeatPassword: '123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: '1',
        email: 'a@a.com',
        password: 'hashed',
      });
      await expect(
        service.register({
          email: 'a@a.com',
          password: '123456',
          repeatPassword: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create user if valid', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({
        id: '1',
        email: 'a@a.com',
        password: 'hashed',
      });
      const result = await service.register({
        email: 'a@a.com',
        password: '123456',
        repeatPassword: '123456',
      });
      expect(result).toEqual({ id: '1', email: 'a@a.com', password: 'hashed' });
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.login({ email: 'a@a.com', password: '123456' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: '1',
        email: 'a@a.com',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockImplementation((plain, hash) => {
        if (plain === 'wrong' && hash === 'hashed') {
          return false;
        }
        return true;
      });
      await expect(
        service.login({ email: 'a@a.com', password: 'wrong' }),
      ).rejects.toThrow(NotFoundException);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
    });

    it('should return token if valid', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: '1',
        email: 'a@a.com',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwt.signAsync.mockResolvedValue('token');
      const token = await service.login({
        email: 'a@a.com',
        password: '123456',
      });
      expect(token).toBe('token');
    });
  });

  describe('recoverPassword', () => {
    it('should use default SMTP host and port if not set in env', async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      prisma.user.update.mockResolvedValueOnce({ ...mockUser });
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashed');
      const mockTransporterDefault = {
        verify: jest.fn().mockResolvedValue(true),
        sendMail: jest.fn().mockResolvedValue(true),
      };
      const createTransportSpy = jest
        .spyOn(nodemailer, 'createTransport')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .mockReturnValue(mockTransporterDefault as any);
      await service.recoverPassword('a@a.com');
      expect(createTransportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'localhost',
          port: 1025,
        }),
      );
      createTransportSpy.mockRestore();
    });
    it('should use SMTP auth if SMTP_USER and SMTP_PASS are set', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      prisma.user.update.mockResolvedValueOnce({ ...mockUser });
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashed');
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'pass123';
      process.env.SMTP_HOST = 'smtp.example.com';
      const mockTransporterWithAuth = {
        verify: jest.fn().mockResolvedValue(true),
        sendMail: jest.fn().mockResolvedValue(true),
      };
      const createTransportSpy = jest
        .spyOn(nodemailer, 'createTransport')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .mockReturnValue(mockTransporterWithAuth as any);
      await service.recoverPassword('a@a.com');
      expect(createTransportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: {
            user: 'user@example.com',
            pass: 'pass123',
          },
        }),
      );
      createTransportSpy.mockRestore();
    });
    const mockUser = { id: '1', email: 'a@a.com', password: 'hashed' };
    let originalEnv: NodeJS.ProcessEnv;
    let mockTransporter: any;

    beforeEach(() => {
      originalEnv = { ...process.env };
      jest.resetModules();
      mockTransporter = {
        verify: jest.fn().mockResolvedValue(true),
        sendMail: jest.fn().mockResolvedValue(true),
      };
      jest
        .spyOn(nodemailer, 'createTransport')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .mockReturnValue(mockTransporter);
    });

    afterEach(() => {
      process.env = originalEnv;
      jest.restoreAllMocks();
    });

    it('should throw if user not found', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.recoverPassword('notfound@a.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update password and send mail', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      prisma.user.update.mockResolvedValueOnce({ ...mockUser });
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashed');
      process.env.SMTP_HOST = 'localhost';
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = await service.recoverPassword('a@a.com');
      expect(prisma.user.update).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(typeof result.message).toBe('string');
      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });

    it('should throw if transporter verify fails', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashed');
      mockTransporter.verify.mockRejectedValueOnce(new Error('fail'));
      await expect(service.recoverPassword('a@a.com')).rejects.toThrow();
    });
  });

  describe('changePassword', () => {
    const mockUser = { id: '1', email: 'a@a.com', password: 'hashed' };

    beforeEach(() => {
      prisma.user.findUnique.mockReset();
      prisma.user.update.mockReset();
      (bcrypt.compare as jest.Mock).mockReset();
      (bcrypt.hash as jest.Mock).mockReset();
    });

    it('should throw if currentPassword is missing', async () => {
      await expect(
        service.changePassword('1', {
          currentPassword: '',
          password: 'new',
          repeatPassword: 'new',
        }),
      ).rejects.toThrow(BadRequestException);
    });
    it('should throw if password is missing', async () => {
      await expect(
        service.changePassword('1', {
          currentPassword: 'old',
          password: '',
          repeatPassword: 'new',
        }),
      ).rejects.toThrow(BadRequestException);
    });
    it('should throw if repeatPassword is missing', async () => {
      await expect(
        service.changePassword('1', {
          currentPassword: 'old',
          password: 'new',
          repeatPassword: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });
    it('should throw if passwords do not match', async () => {
      await expect(
        service.changePassword('1', {
          currentPassword: 'old',
          password: 'new',
          repeatPassword: 'diff',
        }),
      ).rejects.toThrow(BadRequestException);
    });
    it('should throw if password is too short', async () => {
      await expect(
        service.changePassword('1', {
          currentPassword: 'old',
          password: '123',
          repeatPassword: '123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
    it('should throw if user not found', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.changePassword('1', {
          currentPassword: 'old',
          password: 'newpass',
          repeatPassword: 'newpass',
        }),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw if current password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      await expect(
        service.changePassword('1', {
          currentPassword: 'wrong',
          password: 'newpass',
          repeatPassword: 'newpass',
        }),
      ).rejects.toThrow(BadRequestException);
    });
    it('should throw if new password is same as current', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true); // current valid
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true); // new == current
      await expect(
        service.changePassword('1', {
          currentPassword: 'old',
          password: 'samepass',
          repeatPassword: 'samepass',
        }),
      ).rejects.toThrow('A nova senha não pode ser igual à senha atual');
    });
    it('should update password if valid', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true); // current valid
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false); // new != current
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashed');
      prisma.user.update.mockResolvedValueOnce({
        ...mockUser,
        password: 'newhashed',
      });
      const result = await service.changePassword('1', {
        currentPassword: 'old',
        password: 'newpass',
        repeatPassword: 'newpass',
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'newhashed' },
      });
      expect(result).toEqual({ message: 'Senha alterada com sucesso' });
    });
  });
});
