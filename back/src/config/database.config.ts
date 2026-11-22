import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { AddVocabularyTabSortOrder1795300000000 } from '../migrations/1795300000000-AddVocabularyTabSortOrder';
import { CreatePasswordResetChallenges1795400000000 } from '../migrations/1795400000000-CreatePasswordResetChallenges';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: join(__dirname, '../../database/database.sqlite'),
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  // Existing schema must be migrated before a production release.
  synchronize: process.env.NODE_ENV !== 'production',
  // Run only this safe, additive migration in production; older legacy migrations
  // were never registered in this project's startup configuration.
  migrations: [AddVocabularyTabSortOrder1795300000000, CreatePasswordResetChallenges1795400000000],
  migrationsRun: process.env.NODE_ENV === 'production',
  logging: process.env.NODE_ENV !== 'production',
};
