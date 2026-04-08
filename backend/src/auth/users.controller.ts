import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: { user: { sub: string } }) {
    return this.authService.getProfile(req.user.sub);
  }
}
