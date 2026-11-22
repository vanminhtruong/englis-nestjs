import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt, timingSafeEqual, createHash } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { PasswordResetChallenge } from '../../../entities/password-reset-challenge.entity';
import { AuthHashService } from './auth-hash.service';
import { PasswordResetMailService } from './password-reset-mail.service';

const EXPIRES_MS = 10 * 60 * 1000;
const RESEND_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_EMAILS_PER_WINDOW = 30;
const WINDOW_MS = 15 * 60 * 1000;

@Injectable()
export class PasswordResetService {
  private readonly requests = new Map<string, { count: number; until: number }>();
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(PasswordResetChallenge)
    private readonly challenges: Repository<PasswordResetChallenge>,
    private readonly hashService: AuthHashService,
    private readonly mailService: PasswordResetMailService,
    private readonly config: ConfigService,
  ) {}

  private normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  private digest(userId: string, code: string): Buffer {
    const secret = this.config.get<string>('PASSWORD_RESET_SECRET')
      || this.config.get<string>('JWT_SECRET');
    if (!secret) throw new ServiceUnavailableException('Password recovery is unavailable');
    return createHmac('sha256', secret).update(`${userId}:password-reset:${code}`).digest();
  }

  private enforceLimit(email: string, ip: string): void {
    const now = Date.now();
    // Bounded in-process protection against abuse, including nonexistent addresses.
    if (this.requests.size > 4000) {
      for (const [key, entry] of this.requests) {
        if (entry.until <= now) this.requests.delete(key);
      }
      if (this.requests.size > 4000) this.requests.clear();
    }
    const keys = [
      'mail:' + createHash('sha256').update(email).digest('hex'),
      'origin:' + createHash('sha256').update(ip || 'unknown').digest('hex'),
    ];
    for (const key of keys) {
      const entry = this.requests.get(key);
      if (entry && entry.until > now && entry.count >= MAX_EMAILS_PER_WINDOW) {
        throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
      }
    }
    for (const key of keys) {
      const previous = this.requests.get(key);
      this.requests.set(key, previous && previous.until > now
        ? { ...previous, count: previous.count + 1 }
        : { count: 1, until: now + WINDOW_MS });
    }
  }

  async requestCode(rawEmail: string, ip: string): Promise<{ message: string }> {
    if (!this.mailService.isConfigured() ||
      !(this.config.get<string>('PASSWORD_RESET_SECRET') || this.config.get<string>('JWT_SECRET'))) {
      throw new ServiceUnavailableException('Password recovery email is not configured');
    }
    const email = this.normalize(rawEmail);
    this.enforceLimit(email, ip);
    const message = 'If the email is registered, we will send a verification code.';
    const user = await this.users.createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email }).getOne();
    if (!user) return { message };

    const previous = await this.challenges.findOneBy({ userId: user.id });
    const now = Date.now();
    if (previous && now - new Date(previous.lastSentAt).getTime() < RESEND_MS) {
      return { message };
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.challenges.save(this.challenges.create({
      userId: user.id,
      codeHash: this.digest(user.id, code).toString('hex'),
      expiresAt: new Date(now + EXPIRES_MS),
      lastSentAt: new Date(now),
      attempts: 0,
    }));

    try {
      await this.mailService.sendCode(email, code);
    } catch {
      // Never leave a usable code when delivery fails. No code/email in logs.
      await this.challenges.delete({ userId: user.id });
      // Match the response for unknown accounts; do not leak account existence.
      this.logger.warn('Password reset email delivery failed; review SMTP configuration');
      return { message };
    }
    return { message };
  }

  async resetPassword(rawEmail: string, code: string, password: string): Promise<{ success: boolean }> {
    const email = this.normalize(rawEmail);
    const user = await this.users.createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email }).getOne();
    const invalid = () => new BadRequestException('Invalid or expired verification code');
    if (!user) throw invalid();

    return this.challenges.manager.transaction(async (manager) => {
      const challenges = manager.getRepository(PasswordResetChallenge);
      const challenge = await challenges.findOneBy({ userId: user.id });
      if (!challenge || challenge.attempts >= MAX_ATTEMPTS ||
        new Date(challenge.expiresAt).getTime() <= Date.now()) {
        throw invalid();
      }

      const received = this.digest(user.id, code);
      const stored = Buffer.from(challenge.codeHash, 'hex');
      if (received.length !== stored.length || !timingSafeEqual(received, stored)) {
        await challenges.update({ userId: user.id }, { attempts: challenge.attempts + 1 });
        // Do not throw within the transaction or the attempt counter would roll back.
        return { success: false };
      }

      const hashed = await this.hashService.hashPassword(password);
      await manager.getRepository(User).update({ id: user.id }, { password: hashed });
      await challenges.delete({ userId: user.id });
      return { success: true };
    }).then((result) => {
      if (!result.success) throw invalid();
      return result;
    });
  }
}
