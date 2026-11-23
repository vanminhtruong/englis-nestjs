import { MigrationInterface, QueryRunner } from 'typeorm';

// Preserve each learner's most recent difficulty choice separately from
// the official SRS schedule so extra practice can update the attention list.
export class AddSrsLastRating1795600000000 implements MigrationInterface {
  name = 'AddSrsLastRating1795600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('srs_progress'))) return;
    if (await queryRunner.hasColumn('srs_progress', 'lastRating')) return;
    await queryRunner.query(
      'ALTER TABLE "srs_progress" ADD COLUMN "lastRating" text',
    );
  }

  async down(): Promise<void> {
    // Keep the nullable column; dropping it in SQLite could rebuild the table.
  }
}
