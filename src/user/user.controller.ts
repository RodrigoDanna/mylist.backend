import {
  Body,
  Controller,
  Param,
  Post,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto } from './user.dto';
import { AuthGuard } from '@nestjs/passport';

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

  @Post('recover/:email')
  async recoverPassword(@Param('email') email: string) {
    return this.userService.recoverPassword(email);
  }

  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Req() req: { user: { sub: string } },
    @Body()
    body: { currentPassword: string; password: string; repeatPassword: string },
  ) {
    return this.userService.changePassword(req.user.sub, body);
  }
}
