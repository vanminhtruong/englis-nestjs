/**
 * One-time migration from globally shared vocabulary_tab rows to private per-user rows.
 * Run with: node scripts/migrate-vocabulary-tabs-per-user.js
 * Creates a consistent SQLite backup before any changes.
 * Idempotent: only migrates tabs whose userId is NULL.
 */
const path = require('node:path');
const crypto = require('node:crypto');
const Database = require('better-sqlite3');

const databasePath = path.resolve(__dirname, '../database/database.sqlite');
const backupPath = path.resolve(__dirname, '../database/database.sqlite.tabs-backup');
const db = new Database(databasePath);

async function main() {
  // Backup before DDL or data changes, including when SQLite WAL is enabled.
  await db.backup(backupPath);
  db.pragma('foreign_keys = ON');

  const result = db.transaction(() => {
    const columns = db.prepare('PRAGMA table_info(vocabulary_tab)').all();
    if (!columns.some((col) => col.name === 'userId')) {
      db.exec('ALTER TABLE vocabulary_tab ADD COLUMN userId varchar');
    }

    const legacyTabs = db.prepare('SELECT id, name, isDefault FROM vocabulary_tab WHERE userId IS NULL').all();
    if (legacyTabs.length === 0) return { migrated: 0, owners: 0, links: 0 };

    const users = db.prepare('SELECT id FROM users').all();
    if (users.length === 0) {
      throw new Error('Legacy tabs exist but no accounts were found; keeping legacy records unchanged.');
    }

    const linkedWords = db.prepare(`
      SELECT j.vocabulariesId AS id, v.userId AS userId
      FROM vocabulary_tab_vocabularies_vocabularies j
      LEFT JOIN vocabularies v ON v.id = j.vocabulariesId
      WHERE j.vocabularyTabId = ?
    `);
    const insertTab = db.prepare('INSERT INTO vocabulary_tab (id, name, isDefault, userId) VALUES (?, ?, ?, ?)');
    const insertMember = db.prepare(`
      INSERT OR IGNORE INTO vocabulary_tab_vocabularies_vocabularies (vocabularyTabId, vocabulariesId)
      VALUES (?, ?)
    `);
    const transferSelection = db.prepare(`
      UPDATE vocabularies SET activeTabId = ?
      WHERE userId = ? AND activeTabId = ?
    `);
    const deleteMembers = db.prepare('DELETE FROM vocabulary_tab_vocabularies_vocabularies WHERE vocabularyTabId = ?');
    const deleteTab = db.prepare('DELETE FROM vocabulary_tab WHERE id = ?');

    let links = 0;
    for (const legacy of legacyTabs) {
      const members = linkedWords.all(legacy.id);
      if (members.some((word) => !word.userId || !users.some((user) => user.id === word.userId))) {
        throw new Error('Legacy tab contains a word without a valid account; original database is unchanged.');
      }
      // Existing global tabs were visible to every account. Each existing account receives
      // its own private copy; membership and selected-tab state follow the account.
      for (const user of users) {
        const newId = crypto.randomUUID();
        insertTab.run(newId, legacy.name, legacy.isDefault, user.id);
        for (const word of members) {
          if (word.userId === user.id) {
            insertMember.run(newId, word.id);
            links += 1;
          }
        }
        transferSelection.run(newId, user.id, legacy.id);
      }
      deleteMembers.run(legacy.id);
      deleteTab.run(legacy.id);
    }
    return { migrated: legacyTabs.length, owners: users.length, links };
  })();

  console.log('Private tab migration complete:', result);
  console.log('Backup saved at:', backupPath);
}

main().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
}).finally(() => db.close());
