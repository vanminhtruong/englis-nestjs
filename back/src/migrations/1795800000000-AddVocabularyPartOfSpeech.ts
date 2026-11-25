import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVocabularyPartOfSpeech1795800000000
  implements MigrationInterface
{
  name = 'AddVocabularyPartOfSpeech1795800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (
      (await queryRunner.hasTable('vocabularies')) &&
      !(await queryRunner.hasColumn('vocabularies', 'partOfSpeech'))
    ) {
      await queryRunner.query(
        'ALTER TABLE "vocabularies" ADD COLUMN "partOfSpeech" text NOT NULL DEFAULT \'unspecified\'',
      );
    }
  }

  async down(): Promise<void> {
    // Retain classification data; avoid destructive SQLite table rebuild.
  }
}
