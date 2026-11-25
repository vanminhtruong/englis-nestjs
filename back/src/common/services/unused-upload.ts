import { Logger } from '@nestjs/common';
import { lstatSync, realpathSync, unlinkSync } from 'fs';
import { resolve, dirname, basename, sep } from 'path';
import type { EntityManager } from 'typeorm';

const logger = new Logger('UploadCleanup');

// Only files created by the application's upload endpoints. Never resolve
// an external URL, data URL, arbitrary path, or a preset directory.
export function managedUploadPath(value: unknown, root = resolve(process.cwd(), 'uploads')): string | undefined {
  if (typeof value !== 'string') return;
  const match = /^\/uploads\/(?:(tab-icons|user-backgrounds)\/)?([^/\\]+)$/.exec(value);
  if (!match) return;
  const [, folder, name] = match;
  if (!name || !/^[a-z0-9][a-z0-9_. -]*\.[a-z0-9]+$/i.test(name) || name.includes('..')) return;
  const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}\.(?:png|jpe?g|webp|gif|bmp|ico|avif|tiff?)$/i;
  const legacy = /^\d{10,16}(?:-[^/\\]+)?\.(?:png|jpe?g|webp|gif|bmp|ico)$/i;
  if (!uuid.test(name) && (folder || !legacy.test(name))) return;
  const path = resolve(root, folder ?? '', name);
  if (!path.startsWith(resolve(root) + sep)) return;
  return path;
}

export function snapshotUploadCandidates(payload: string): unknown[] {
  try {
    const data = JSON.parse(payload);
    const candidates: unknown[] = [];
    for (const [group, fields] of Object.entries({
      vocabularies: ['image', 'video', 'audio', 'backgroundUrl', 'animatedBackground'],
      categories: ['icon'], tabs: ['icon'], dateTopics: ['icon'], topics: ['icon'],
    })) {
      if (!Array.isArray(data?.[group])) continue;
      for (const row of data[group]) for (const field of fields) candidates.push(row?.[field]);
    }
    return candidates;
  } catch { return []; }
}

const mediaFields: Record<string, string[]> = {
  vocabularies: ['image', 'video', 'audio', 'backgroundUrl', 'animatedBackground'],
  vocabulary_tabs: ['icon'],
  vocabulary_tab: ['icon'],
  categories: ['icon'],
  category_date_topics: ['icon'],
  users: ['avatar'],
  backgrounds: ['url', 'icon'],
  background_categories: ['icon'],
  user_backgrounds: ['url'],
  data_shares: ['payload'],
};

/**
 * Delete explicit superseded candidates only after the write has committed.
 * Search all accounts and pending share snapshots, including full URLs.
 * A failed lookup, transaction, symlink, or unlink must never turn a
 * successful save into an error. Conservative matches retain files.
 */
export async function cleanupUnusedUploads(
  manager: EntityManager,
  values: unknown[],
  root = resolve(process.cwd(), 'uploads'),
): Promise<void> {
  if (manager.queryRunner?.isTransactionActive || manager.connection.createQueryRunner().isTransactionActive) return;
  for (const path of new Set(values.map(value => managedUploadPath(value, root)).filter((v): v is string => !!v))) {
    try {
      const stat = lstatSync(path, { throwIfNoEntry: false });
      if (!stat?.isFile() || stat.isSymbolicLink()) continue;
      const actualRoot = realpathSync(root);
      if (!realpathSync(dirname(path)).startsWith(actualRoot + sep) && realpathSync(dirname(path)) !== actualRoot) continue;
      if (realpathSync(path) !== resolve(actualRoot, path.slice(resolve(root).length + 1))) continue;
      // One SQL statement, with no await between its result and unlink.
      // Match the filename, not just the relative URL, to protect absolute URLs
      // and JSON snapshots. Table/column names are fixed in source code.
      const queries = manager.connection.entityMetadatas.flatMap(meta => {
        const fields = mediaFields[meta.tableName]?.filter(field => meta.columns.some(column => column.databaseName === field));
        if (!fields?.length) return [];
        const predicates = fields.map(field => `(instr(lower(COALESCE("${field}", '')), ?) > 0 OR instr(lower(COALESCE("${field}", '')), ?) > 0)`).join(' OR ');
        const status = meta.tableName === 'data_shares' ? "status = 'pending' AND " : '';
        return [{ sql: `SELECT 1 AS referenced FROM "${meta.tableName}" WHERE ${status}(${predicates})`, count: fields.length }];
      });
      if (!queries.length) continue;
      const name = basename(path).toLowerCase();
      if (manager.connection.createQueryRunner().isTransactionActive) continue;
      const refs = await manager.query(`SELECT 1 FROM (${queries.map(q => q.sql).join(' UNION ALL ')}) LIMIT 1`, queries.flatMap(q => Array.from({ length: q.count }, () => [name, encodeURIComponent(name).toLowerCase()]).flat()));
      if (!refs.length && !manager.connection.createQueryRunner().isTransactionActive) unlinkSync(path);
    } catch (error: any) {
      if (error?.code !== 'ENOENT') logger.warn('Unused upload retained; cleanup could not safely complete.');
    }
  }
}
