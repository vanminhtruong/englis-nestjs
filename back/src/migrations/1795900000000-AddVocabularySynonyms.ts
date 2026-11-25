import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddVocabularySynonyms1795900000000 implements MigrationInterface {
  name = 'AddVocabularySynonyms1795900000000';
  async up(runner: QueryRunner): Promise<void> {
    if (await runner.hasTable('vocabularies') && !(await runner.hasColumn('vocabularies', 'synonyms'))) {
      await runner.query('ALTER TABLE "vocabularies" ADD COLUMN "synonyms" text');
    }
  }
  async down(): Promise<void> { /* Preserve user-entered synonyms. */ }
}
