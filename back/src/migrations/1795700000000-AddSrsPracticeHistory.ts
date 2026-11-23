import { MigrationInterface, QueryRunner } from 'typeorm';

// Adds a harmless marker so scheduled reviews and extra practice share one
// append-only history without changing the learner's existing review dates.
export class AddSrsPracticeHistory1795700000000 implements MigrationInterface {
  name = 'AddSrsPracticeHistory1795700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('srs_reviews'))) return;
    if (await queryRunner.hasColumn('srs_reviews', 'isPracticeOnly')) return;
    await queryRunner.query(
      'ALTER TABLE "srs_reviews" ADD COLUMN "isPracticeOnly" boolean NOT NULL DEFAULT (0)',
    );
  }

  async down(): Promise<void> {
    // Avoid rebuilding a populated SQLite history table.
  }
}
