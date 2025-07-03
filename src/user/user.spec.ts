import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto } from './user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = {
      register: jest.fn(),
      login: jest.fn(),
      recoverPassword: jest.fn(),
      changePassword: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();
    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call userService.register with correct dto', async () => {
      const dto: CreateUserDto = {
        email: 'a@b.com',
        password: '123456',
        repeatPassword: '123456',
      };
      const result = { id: '1', email: dto.email };
      (userService.register as jest.Mock).mockResolvedValue(result);
      expect(await controller.register(dto)).toBe(result);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.register as jest.Mock).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call userService.login with correct dto', async () => {
      const dto: LoginUserDto = { email: 'a@b.com', password: '123456' };
      const token = 'jwt.token';
      (userService.login as jest.Mock).mockResolvedValue(token);
      expect(await controller.login(dto)).toBe(token);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.login as jest.Mock).toHaveBeenCalledWith(dto);
    });
  });

  describe('recoverPassword', () => {
    it('should call userService.recoverPassword with correct email', async () => {
      const email = 'a@b.com';
      const result = { message: 'sent' };
      (userService.recoverPassword as jest.Mock).mockResolvedValue(result);
      expect(await controller.recoverPassword(email)).toBe(result);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.recoverPassword as jest.Mock).toHaveBeenCalledWith(
        email,
      );
    });
  });

  describe('changePassword', () => {
    it('should call userService.changePassword with correct params', async () => {
      const req = { user: { sub: 'user-id' } };
      const body = {
        currentPassword: 'old',
        password: 'new',
        repeatPassword: 'new',
      };
      const result = { message: 'ok' };
      (userService.changePassword as jest.Mock).mockResolvedValue(result);
      expect(await controller.changePassword(req, body)).toBe(result);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userService.changePassword as jest.Mock).toHaveBeenCalledWith(
        req.user.sub,
        body,
      );
    });
  });
});
