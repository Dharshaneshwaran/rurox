import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import type { AuthUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body.name, body.email, body.password);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request & { user?: AuthUser }) {
    if (!req.user) {
      return { user: null };
    }

    return this.authService.me(req.user.id);
  }
}
