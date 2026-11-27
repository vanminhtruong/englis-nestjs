import { join } from 'path';
import { validate } from 'class-validator';
import { DataSource } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { AddSeasonalThemesPreference1796100000000 } from '../../../migrations/1796100000000-AddSeasonalThemesPreference';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from './auth.service';

describe('Seasonal theme preference', () => {
  it('defaults existing accounts to off when migrating an existing database', async () => {
    const db = await new DataSource({ type: 'better-sqlite3', database: ':memory:' }).initialize();
    const runner = db.createQueryRunner();
    try {
      await runner.query('CREATE TABLE users (id text PRIMARY KEY, theme text)');
      await runner.query('INSERT INTO users (id, theme) VALUES (?, ?)', ['existing', 'dark']);
      const migration = new AddSeasonalThemesPreference1796100000000();
      await migration.up(runner);
      await migration.up(runner);

      expect(await runner.query('SELECT * FROM users')).toEqual([
        { id: 'existing', theme: 'dark', seasonalThemesEnabled: 0 },
      ]);
    } finally {
      await runner.release();
      await db.destroy();
    }
  });

  it('persists true and false per account and preserves the theme on a partial update', async () => {
    const db = await new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [join(__dirname, '../../../entities/*.entity.ts')],
      synchronize: true,
    }).initialize();

    try {
      const users = new UserRepository(db.getRepository(User));
      const service = new AuthService(users, {} as never, {} as never, {} as never, {} as never);
      const first = await users.create({ fullName: 'First', theme: 'dark' });
      const second = await users.create({ fullName: 'Second' });

      expect(await service.updateProfile(first.id, { seasonalThemesEnabled: true })).toMatchObject({
        seasonalThemesEnabled: true,
        theme: 'dark',
      });
      expect(await service.updateProfile(first.id, { fullName: 'Renamed' })).toMatchObject({
        seasonalThemesEnabled: true,
      });
      expect(await service.validateUser(second.id)).toMatchObject({ seasonalThemesEnabled: false });
      expect(await service.updateProfile(first.id, { seasonalThemesEnabled: false })).toMatchObject({
        seasonalThemesEnabled: false,
        theme: 'dark',
      });
    } finally {
      await db.destroy();
    }
  });

  it.each([null, 'false', 1])('rejects a non-boolean value (%p) on profile updates', async (value) => {
    const dto = Object.assign(new UpdateProfileDto(), { seasonalThemesEnabled: value });
    expect(await validate(dto)).toEqual([
      expect.objectContaining({ property: 'seasonalThemesEnabled' }),
    ]);
  });
});
