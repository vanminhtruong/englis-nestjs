import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddVideoToVocabulary1731999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'vocabularies',
      new TableColumn({
        name: 'video',
        type: 'varchar',
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('vocabularies', 'video');
  }
}
