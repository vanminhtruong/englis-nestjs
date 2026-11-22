import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import { User } from '../../../entities/user.entity';
import { PasswordResetChallenge } from '../../../entities/password-reset-challenge.entity';
import { AuthHashService } from './auth-hash.service';
import { PasswordResetMailService } from './password-reset-mail.service';
import { PasswordResetService } from './password-reset.service';
import { CreatePasswordResetChallenges1795400000000 } from '../../../migrations/1795400000000-CreatePasswordResetChallenges';

describe('Password recovery with verified email code', () => {
  let database: DataSource;
  let service: PasswordResetService;
  let sent: { to: string; code: string }[];
  let user: User;
  let mailer: { isConfigured: () => boolean; sendCode: jest.Mock };

  beforeEach(async () => {
    database = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [join(__dirname, '../../../entities/*.entity.ts')],
      synchronize: true,
      logging: false,
    });
    await database.initialize();
    sent = [];
    mailer = {
      isConfigured: () => true,
      sendCode: jest.fn(async (to: string, code: string) => { sent.push({ to, code }); }),
    };
    const config = new ConfigService({ PASSWORD_RESET_SECRET: 'test-secret-do-not-use-in-production' });
    service = new PasswordResetService(
      database.getRepository(User),
      database.getRepository(PasswordResetChallenge),
      new AuthHashService(),
      mailer as unknown as PasswordResetMailService,
      config,
    );
    user = await database.getRepository(User).save(database.getRepository(User).create({
      email: 'known@example.test',
      fullName: 'Test account',
      password: await bcrypt.hash('old-password123', 10),
    }));
  });

  afterEach(async () => {
    if (database?.isInitialized) await database.destroy();
  });

  it('does not disclose whether an email exists', async () => {
    const known = await service.requestCode('KNOWN@example.test', 'test-connection');
    const unknown = await service.requestCode('missing@example.test', 'test-connection');
    expect(known).toEqual(unknown);
    expect(sent).toHaveLength(1);
    expect(sent[0]?.to).toBe('known@example.test');
  });

  it('persists only the code digest, then changes the password once', async () => {
    await service.requestCode('known@example.test', 'test-connection');
    const code = sent[0]!.code;
    expect(code).toMatch(/^\d{6}$/);
    const repo = database.getRepository(PasswordResetChallenge);
    const challenge = await repo.findOneByOrFail({ userId: user.id });
    expect(challenge.codeHash).not.toBe(code);
    expect(challenge.codeHash).toMatch(/^[a-f0-9]{64}$/);

    await expect(service.resetPassword(user.email, code, 'new-password123')).resolves.toEqual({ success: true });
    const updatedUser = await database.getRepository(User).findOneByOrFail({ id: user.id });
    expect(await bcrypt.compare('new-password123', updatedUser.password)).toBe(true);
    expect(await bcrypt.compare('old-password123', updatedUser.password)).toBe(false);
    expect(await repo.findOneBy({ userId: user.id })).toBeNull();
    await expect(service.resetPassword(user.email, code, 'another-password123')).rejects.toThrow();
  });

  it('counts incorrect codes and blocks the code after five attempts', async () => {
    await service.requestCode(user.email, 'test-connection');
    const code = sent[0]!.code;
    const wrong = code === '000000' ? '999999' : '000000';
    for (let index = 1; index <= 5; index++) {
      await expect(service.resetPassword(user.email, wrong, 'new-password123')).rejects.toThrow();
      const challenge = await database.getRepository(PasswordResetChallenge).findOneByOrFail({ userId: user.id });
      expect(challenge.attempts).toBe(index);
    }
    await expect(service.resetPassword(user.email, code, 'new-password123')).rejects.toThrow();
  });

  it('rejects expired codes and restricts resend frequency', async () => {
    await service.requestCode(user.email, 'test-connection');
    await service.requestCode(user.email, 'test-connection');
    expect(sent).toHaveLength(1);
    const repo = database.getRepository(PasswordResetChallenge);
    await repo.update({ userId: user.id }, { expiresAt: new Date(Date.now() - 1000) });
    await expect(service.resetPassword(user.email, sent[0]!.code, 'new-password123')).rejects.toThrow();
    await repo.update({ userId: user.id }, { lastSentAt: new Date(Date.now() - 61_000) });
    await service.requestCode(user.email, 'test-connection');
    expect(sent).toHaveLength(2);
    expect(sent[1]!.code).not.toBeUndefined();
  });

  it('invalidates an undelivered code', async () => {
    mailer.sendCode.mockRejectedValueOnce(new Error('SMTP unavailable'));
    await expect(service.requestCode(user.email, 'test-connection')).resolves.toEqual({
      message: 'If the email is registered, we will send a verification code.',
    });
    expect(await database.getRepository(PasswordResetChallenge).findOneBy({ userId: user.id })).toBeNull();
  });

  it('safely creates the SQLite table on existing installations and on repeat migration', async () => {
    const queryRunner = database.createQueryRunner();
    try {
      await queryRunner.dropTable('password_reset_challenges');
      const migration = new CreatePasswordResetChallenges1795400000000();
      await migration.up(queryRunner);
      expect(await queryRunner.hasTable('password_reset_challenges')).toBe(true);
      await migration.up(queryRunner);
      expect(await queryRunner.hasTable('password_reset_challenges')).toBe(true);
    } finally {
      await queryRunner.release();
    }
  });
});
