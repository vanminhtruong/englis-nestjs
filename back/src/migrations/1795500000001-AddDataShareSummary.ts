import { MigrationInterface, QueryRunner } from 'typeorm';

/** Adds the counts shown to the recipient (categories, tags, tabs, ...). */
export class AddDataShareSummary1795500000001 implements MigrationInterface {
  name = 'AddDataShareSummary1795500000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('data_shares'))) return;
    if (await queryRunner.hasColumn('data_shares', 'summary')) return;
    // Plain ALTER: TypeORM's addColumn rebuilds the whole table on SQLite.
    await queryRunner.query('ALTER TABLE "data_shares" ADD COLUMN "summary" text');
  }

  async down(): Promise<void> {
    // SQLite cannot drop a column safely; the column is nullable and harmless.
  }
}