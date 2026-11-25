import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVocabularySelectedSynonym1796000000000 implements MigrationInterface {
  name = 'AddVocabularySelectedSynonym1796000000000';
  async up(runner: QueryRunner): Promise<void> {
    if (await runner.hasTable('vocabularies') && !(await runner.hasColumn('vocabularies', 'selectedSynonym'))) {
      await runner.query('ALTER TABLE "vocabularies" ADD COLUMN "selectedSynonym" text');
    }
  }
  async down(): Promise<void> { /* Preserve the user's selection. */ }
}
