import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/** Adds per-user tab order without changing or removing existing vocabulary data. */
export class AddVocabularyTabSortOrder1795300000000 implements MigrationInterface {
  name = 'AddVocabularyTabSortOrder1795300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('vocabulary_tab'))) return;
    if (await queryRunner.hasColumn('vocabulary_tab', 'sortOrder')) return;

    await queryRunner.addColumn(
      'vocabulary_tab',
      new TableColumn({
        name: 'sortOrder',
        type: 'integer',
        isNullable: false,
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('vocabulary_tab', 'sortOrder')) {
      await queryRunner.dropColumn('vocabulary_tab', 'sortOrder');
    }
  }
}
