import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { AddVocabularyTabSortOrder1795300000000 } from '../migrations/1795300000000-AddVocabularyTabSortOrder';
import { CreatePasswordResetChallenges1795400000000 } from '../migrations/1795400000000-CreatePasswordResetChallenges';
import { CreateDataShares1795500000000 } from '../migrations/1795500000000-CreateDataShares';
import { AddDataShareSummary1795500000001 } from '../migrations/1795500000001-AddDataShareSummary';
import { AddSrsLastRating1795600000000 } from '../migrations/1795600000000-AddSrsLastRating';
import { AddSrsPracticeHistory1795700000000 } from '../migrations/1795700000000-AddSrsPracticeHistory';

import { AddVocabularyPartOfSpeech1795800000000 } from '../migrations/1795800000000-AddVocabularyPartOfSpeech';

import { AddVocabularySynonyms1795900000000 } from '../migrations/1795900000000-AddVocabularySynonyms';

import { AddVocabularySelectedSynonym1796000000000 } from '../migrations/1796000000000-AddVocabularySelectedSynonym';

import { AddSeasonalThemesPreference1796100000000 } from '../migrations/1796100000000-AddSeasonalThemesPreference';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: join(__dirname, '../../database/database.sqlite'),
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  // Existing schema must be migrated before a production release.
  synchronize: process.env.NODE_ENV !== 'production',
  // Run only this safe, additive migration in production; older legacy migrations
  // were never registered in this project's startup configuration.
  migrations: [
    AddVocabularyTabSortOrder1795300000000,
    CreatePasswordResetChallenges1795400000000,
    CreateDataShares1795500000000,
    AddDataShareSummary1795500000001,
    AddSrsLastRating1795600000000,
    AddSrsPracticeHistory1795700000000,
    AddVocabularyPartOfSpeech1795800000000,
    AddVocabularySynonyms1795900000000,
    AddVocabularySelectedSynonym1796000000000,
    AddSeasonalThemesPreference1796100000000,
  ],
  migrationsRun: process.env.NODE_ENV === 'production',
  logging: process.env.NODE_ENV !== 'production',
};
