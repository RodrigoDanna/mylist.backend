import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'mysecret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [UserService, PrismaService],
  exports: [],
})
export class AuthModule {}
