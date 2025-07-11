import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto, LoginUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: CreateUserDto): Promise<User> {
    // Check if passwords match
    if (data.password !== data.repeatPassword) {
      throw new BadRequestException('As senhas devem ser iguais');
    }

    // Check password length
    if (data.password.length < 6) {
      throw new BadRequestException(
        'A nova senha deve ter pelo menos 6 caracteres',
      );
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    return user;
  }

  async login({ email, password }: LoginUserDto): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuário e/ou senha inválidos');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new NotFoundException('Usuário e/ou senha inválidos');
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return token;
  }

  async recoverPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Generate a new random password
    const newPassword = crypto
      .randomBytes(6)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 10);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // For local SMTP testing, use Mailhog on http://localhost:8025/
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT) || 1025,
      secure: false,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });

    // Optionally verify transporter before sending
    await transporter.verify().catch(() => {
      throw new InternalServerErrorException(
        'Falha ao conectar ao servidor de e-mail',
      );
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER || 'no-reply@localhost',
      to: email,
      subject: 'Recuperação de senha',
      text: `Sua nova senha é: ${newPassword}`,
    });

    if (process.env.SMTP_HOST === 'localhost') {
      console.log(
        `Nova senha enviada para ${email}: ${newPassword}. Verifique o Mailhog em http://localhost:8025`,
      );
    }

    return { message: 'Uma nova senha foi enviada para o seu e-mail' };
  }

  async changePassword(
    id: string,
    body: { currentPassword: string; password: string; repeatPassword: string },
  ): Promise<{ message: string }> {
    const { currentPassword, password, repeatPassword } = body;

    if (!currentPassword) {
      throw new BadRequestException('O campo senha atual é obrigatório');
    }
    if (!password) {
      throw new BadRequestException('O campo nova senha é obrigatório');
    }
    if (!repeatPassword) {
      throw new BadRequestException('O campo repetir nova senha é obrigatório');
    }

    if (password !== repeatPassword) {
      throw new BadRequestException('As senhas devem ser iguais');
    }

    if (password.length < 6) {
      throw new BadRequestException(
        'A nova senha deve ter pelo menos 6 caracteres',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    if (await bcrypt.compare(password, user.password)) {
      throw new BadRequestException(
        'A nova senha não pode ser igual à senha atual',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Senha alterada com sucesso' };
  }
}
