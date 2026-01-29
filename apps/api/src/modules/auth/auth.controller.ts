import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthService, LoginResult } from './auth.service';
import { loginSchema, refreshTokenSchema } from '@sigeo/shared';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  async login(@Body() body: unknown): Promise<LoginResult> {
    const { email, password } = loginSchema.parse(body);
    return this.auth.login(email, password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  async refresh(@Body() body: unknown): Promise<LoginResult> {
    const { refreshToken } = refreshTokenSchema.parse(body);
    return this.auth.refresh(refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Usuário autenticado' })
  async me(@CurrentUser('sub') sub: string) {
    return this.auth.getMe(sub);
  }
}
