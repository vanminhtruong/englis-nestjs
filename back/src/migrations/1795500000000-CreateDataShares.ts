import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDataShares1795500000000 implements MigrationInterface {
  name = 'CreateDataShares1795500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('data_shares')) return;
    await queryRunner.createTable(
      new Table({
        name: 'data_shares',
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'senderId', type: 'varchar', isNullable: false },
          { name: 'recipientId', type: 'varchar', isNullable: false },
          { name: 'recipientEmail', type: 'varchar', isNullable: false },
          { name: 'status', type: 'text', default: "'pending'", isNullable: false },
          { name: 'payload', type: 'text', isNullable: false },
          { name: 'vocabularyCount', type: 'integer', default: 0, isNullable: false },
          { name: 'historyCount', type: 'integer', default: 0, isNullable: false },
          { name: 'resultStats', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'datetime', default: "datetime('now')", isNullable: false },
          { name: 'respondedAt', type: 'datetime', isNullable: true },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'data_shares',
      new TableIndex({
        name: 'IDX_data_shares_recipient_status',
        columnNames: ['recipientId', 'status'],
      }),
    );
    await queryRunner.createIndex(
      'data_shares',
      new TableIndex({
        name: 'IDX_data_shares_sender_status',
        columnNames: ['senderId', 'status'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('data_shares')) {
      await queryRunner.dropTable('data_shares');
    }
  }
}
