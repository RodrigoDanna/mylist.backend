import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UserDto,
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  CreateUserReturnDto,
  LoginUserReturnDto,
  UserMessageReturnDto,
  UpdateUserReturnDto,
} from './user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: CreateUserDto): Promise<CreateUserReturnDto> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = (await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    })) as UserDto;

    return { id: user.id, message: 'Usuário registrado com sucesso' };
  }

  async login({ email, password }: LoginUserDto): Promise<LoginUserReturnDto> {
    const user = (await this.prisma.user.findUnique({
      where: { email },
    })) as UserDto;

    if (!user) {
      return { message: 'Usuário não encontrado' };
    }

    const isValid = await bcrypt.compare(password, user.password!);

    if (!isValid) {
      return { message: 'Senha inválida' };
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }

  logout(): UserMessageReturnDto {
    return { message: 'Logout efetuado' };
  }

  async getUserById(id: string): Promise<UserMessageReturnDto | UserDto> {
    const user = (await this.prisma.user.findUnique({
      where: { id },
    })) as UserDto;

    if (!user) {
      return { message: 'Usuário não encontrado' };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }

  async updateUser(
    id: string,
    data: UpdateUserDto,
  ): Promise<UpdateUserReturnDto> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = (await this.prisma.user.update({
      where: { id },
      data,
    })) as UserDto;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return { user: result, message: 'Usuário atualizado' };
  }
}
