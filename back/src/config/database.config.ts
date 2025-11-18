import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: join(__dirname, '../../database/database.sqlite'),
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: true, // Chỉ dùng trong development, production nên dùng migrations
  logging: true,
};
