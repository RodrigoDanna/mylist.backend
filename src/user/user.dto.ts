export class CreateUserDto {
  email: string;
  password: string;
  repeatPassword: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}
