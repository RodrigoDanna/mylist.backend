export class UserDto {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
}
export class CreateUserReturnDto {
  id: string;
  message: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}
export class LoginUserReturnDto {
  access_token?: string;
  message?: string;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}
export class UpdateUserReturnDto {
  user: UserDto;
  message: string;
}

export class UserMessageReturnDto {
  message: string;
}
