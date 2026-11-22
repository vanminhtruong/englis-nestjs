import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: join(__dirname, '../../database/database.sqlite'),
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  // Existing schema must be migrated before a production release.
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
};
