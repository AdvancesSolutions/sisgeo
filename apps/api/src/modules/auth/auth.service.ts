import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { MailService } from '../../common/mail.service';

const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'sigeo-refresh-dev-change-in-prod';
const RESET_EXPIRES_MS = 60 * 60 * 1000; // 1 hora
const APP_URL = process.env.APP_URL ?? process.env.CORS_ORIGIN ?? 'http://localhost:5173';

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
    private readonly mail: MailService,
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

  async getMe(userId: string): Promise<{ id: string; name: string; email: string; role: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return { id: user.id, name: user.name, email: user.email, role: user.role };
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

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return { message: 'Se o e-mail estiver cadastrado, você receberá o link de redefinição em breve.' };
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + RESET_EXPIRES_MS);
    await this.userRepo.update(user.id, {
      passwordResetToken: token,
      passwordResetExpires: expires,
    });
    const resetLink = `${APP_URL.replace(/\/$/, '')}/reset-password?token=${token}`;
    await this.mail.sendPasswordResetEmail(user.email, resetLink);
    return { message: 'Se o e-mail estiver cadastrado, você receberá o link de redefinição em breve.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { passwordResetToken: token },
    });
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token inválido ou expirado. Solicite uma nova redefinição.');
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(user.id, {
      passwordHash: hash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
    return { message: 'Senha alterada com sucesso. Faça login com a nova senha.' };
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
