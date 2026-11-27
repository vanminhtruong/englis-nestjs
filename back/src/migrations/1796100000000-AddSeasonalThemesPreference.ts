import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeasonalThemesPreference1796100000000 implements MigrationInterface {
  name = 'AddSeasonalThemesPreference1796100000000';

  async up(runner: QueryRunner): Promise<void> {
    if (await runner.hasTable('users') && !(await runner.hasColumn('users', 'seasonalThemesEnabled'))) {
      await runner.query('ALTER TABLE "users" ADD COLUMN "seasonalThemesEnabled" boolean NOT NULL DEFAULT (0)');
    }
  }

  async down(): Promise<void> {
    // Retain the account preference if the application rolls back.
  }
}
