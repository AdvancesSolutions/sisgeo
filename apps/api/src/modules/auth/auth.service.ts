import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'sigeo-refresh-dev-change-in-prod';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; name: string; email: string; role: string };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<LoginResult> {
    try {
      const payload = this.jwt.verify(refreshToken, { secret: REFRESH_SECRET }) as {
        sub: string;
        email: string;
      };
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Token inválido');
      }
      return this.issueTokens(user);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private issueTokens(user: User): LoginResult {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(
      { sub: user.id, email: user.email },
      { secret: REFRESH_SECRET, expiresIn: REFRESH_EXPIRES },
    );
    const expiresIn = 15 * 60;
    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}
