import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePracticeModes1699999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'practice_modes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'key',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'varchar',
          },
          {
            name: 'icon',
            type: 'varchar',
          },
          {
            name: 'color',
            type: 'varchar',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sortOrder',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Insert default practice modes
    await queryRunner.query(`
      INSERT INTO practice_modes (key, name, description, icon, color, "sortOrder") VALUES
      ('flashcard', 'Flashcard', 'What is the meaning of this word?', '🎴', 'from-primary-500 to-secondary-500', 1),
      ('typing', 'Typing', 'Type the corresponding word', '⌨️', 'from-purple-500 to-pink-500', 2),
      ('practice_by_date', 'Practice by Date', 'Select a specific date to practice', '📅', 'from-orange-500 to-red-500', 3),
      ('multiple_choice', 'Multiple Choice', 'Select the correct answer', '📝', 'from-blue-500 to-cyan-500', 4),
      ('listening', 'Listening', 'Listen and identify the word', '🎧', 'from-green-500 to-emerald-500', 5);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('practice_modes');
  }
}
