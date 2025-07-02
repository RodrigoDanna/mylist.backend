export class CreateUserDto {
  email: string;
  password: string;
  repeatPassword: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}
