import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePasswordResetChallenges1795400000000 implements MigrationInterface {
  name = 'CreatePasswordResetChallenges1795400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('password_reset_challenges')) return;
    await queryRunner.createTable(
      new Table({
        name: 'password_reset_challenges',
        columns: [
          { name: 'userId', type: 'varchar', isPrimary: true },
          { name: 'codeHash', type: 'varchar', isNullable: false },
          { name: 'expiresAt', type: 'datetime', isNullable: false },
          { name: 'lastSentAt', type: 'datetime', isNullable: false },
          { name: 'attempts', type: 'integer', default: 0, isNullable: false },
        ],
      }),
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('password_reset_challenges')) {
      await queryRunner.dropTable('password_reset_challenges');
    }
  }
}
