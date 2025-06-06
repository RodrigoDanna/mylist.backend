import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post('logout')
  logout() {
    return this.userService.logout();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }
}
