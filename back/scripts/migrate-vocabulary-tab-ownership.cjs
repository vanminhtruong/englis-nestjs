/**
 * One-time data migration for legacy vocabulary tabs that were shared globally.
 *
 * Usage: node scripts/migrate-vocabulary-tab-ownership.cjs
 *
 * A legacy tab cannot reveal who originally created it because no owner was
 * recorded. To preserve the tabs previously visible to every existing account,
 * make an independent copy for each existing user. Copy word relationships
 * ONLY for vocabularies owned by that user; never share a word across accounts.
 * Subsequent runs do nothing (no more unowned tabs).
 */
const Database = require('better-sqlite3');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

async function main() {
  const dbPath = path.resolve(__dirname, '../database/database.sqlite');
  const db = new Database(dbPath);
  try {
    const table = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='vocabulary_tab'",
    ).get();
    if (!table) {
      console.log('No legacy vocabulary_tab table; nothing to migrate.');
      return;
    }

    const columns = db.pragma('table_info(vocabulary_tab)').map((column) => column.name);
    const legacyCount = columns.includes('userId')
      ? db.prepare('SELECT COUNT(*) AS count FROM vocabulary_tab WHERE userId IS NULL').get().count
      : db.prepare('SELECT COUNT(*) AS count FROM vocabulary_tab').get().count;

    if (legacyCount === 0) {
      console.log('Vocabulary tabs already scoped to accounts; nothing to migrate.');
      return;
    }

    // SQLite's backup API works with an open database (including WAL mode).
    const backup = dbPath + '.before-tab-ownership-' + new Date().toISOString().replace(/[:.]/g, '-') + '.bak';
    await db.backup(backup);
    console.log('Database backed up before changing legacy tabs.');

    const hasJoinTable = Boolean(db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='vocabulary_tab_vocabularies_vocabularies'",
    ).get());

    const migrate = db.transaction(() => {
      if (!columns.includes('userId')) {
        db.exec('ALTER TABLE vocabulary_tab ADD COLUMN userId varchar');
      }

      const existingUsers = db.prepare('SELECT id FROM users').all();
      const oldTabs = db.prepare('SELECT id, name, isDefault FROM vocabulary_tab WHERE userId IS NULL').all();
      const insertTab = db.prepare('INSERT INTO vocabulary_tab (id, name, isDefault, userId) VALUES (?, ?, ?, ?)');
      const updateSelection = db.prepare(
        'UPDATE vocabularies SET activeTabId = ? WHERE userId = ? AND activeTabId = ?',
      );
      const insertJoin = hasJoinTable ? db.prepare(
        'INSERT OR IGNORE INTO vocabulary_tab_vocabularies_vocabularies (vocabularyTabId, vocabulariesId) VALUES (?, ?)',
      ) : null;
      const getOwnedMembers = hasJoinTable ? db.prepare(
        'SELECT v.id FROM vocabulary_tab_vocabularies_vocabularies j ' +
        'JOIN vocabularies v ON v.id = j.vocabulariesId ' +
        'WHERE j.vocabularyTabId = ? AND v.userId = ?',
      ) : null;
      const deleteJoins = hasJoinTable ? db.prepare(
        'DELETE FROM vocabulary_tab_vocabularies_vocabularies WHERE vocabularyTabId = ?',
      ) : null;
      const deleteTab = db.prepare('DELETE FROM vocabulary_tab WHERE id = ?');

      let newTabs = 0;
      for (const tab of oldTabs) {
        for (const user of existingUsers) {
          const newId = randomUUID();
          insertTab.run(newId, tab.name, tab.isDefault, user.id);
          if (getOwnedMembers && insertJoin) {
            for (const word of getOwnedMembers.all(tab.id, user.id)) {
              insertJoin.run(newId, word.id);
            }
          }
          updateSelection.run(newId, user.id, tab.id);
          newTabs++;
        }
        if (deleteJoins) deleteJoins.run(tab.id);
        deleteTab.run(tab.id);
      }
      db.exec('CREATE INDEX IF NOT EXISTS IDX_vocabulary_tab_userId ON vocabulary_tab (userId)');
      return { oldTabs: oldTabs.length, newTabs, users: existingUsers.length };
    });

    const result = migrate();
    console.log('Account isolation migration complete:', JSON.stringify(result));
    console.log('Legacy tab names were copied independently for existing accounts.');
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error('Tab ownership migration failed:', error.message);
  process.exitCode = 1;
});
