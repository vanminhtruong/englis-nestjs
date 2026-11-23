import type { Cell, CellValue, Worksheet } from 'exceljs';
import {
  SnapshotCategory,
  SnapshotTab,
  UserDataSnapshot,
  emptySnapshot,
} from './user-data-snapshot';

/**
 * Excel layout of a UserDataSnapshot.
 *
 * "Vocabularies" and "Practice History" keep their original columns in their
 * original order, so files exported by older versions still import. Everything
 * else lives in its own sheet and is optional when reading.
 */

const SHEETS = {
  vocabularies: 'Vocabularies',
  history: 'Practice History',
  categories: 'Categories',
  categoryWords: 'Category Words',
  tags: 'Tags',
  dateTopics: 'Date Topics',
  tabs: 'Tabs',
  tabWords: 'Tab Words',
  srs: 'Smart Review',
  srsHistory: 'Smart Review History',
} as const;

// Excel refuses cells longer than 32767 characters (e.g. base64 images).
const CELL_LIMIT = 32000;
const DATE_FORMAT = 'yyyy-mm-dd hh:mm:ss';

type Column = { header: string; key: string; width: number; date?: boolean };

const cap = (value: unknown) =>
  typeof value === 'string' && value.length > CELL_LIMIT ? '' : value;

const asDate = (value: string | null | undefined): Date | string =>
  value ? new Date(value) : '';

const yesNo = (value: unknown) => (value ? 'Yes' : 'No');

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export async function snapshotToXlsxBuffer(snapshot: UserDataSnapshot): Promise<Buffer> {
  // ExcelJS is loaded only when importing or exporting data, not on server startup.
  const ExcelJS = require('exceljs') as typeof import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'English Learning App';
  workbook.created = new Date();

  const addSheet = (name: string, columns: Column[], rows: Array<Record<string, unknown>>) => {
    const sheet = workbook.addWorksheet(name);
    sheet.columns = columns.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width,
      ...(c.date ? { style: { numFmt: DATE_FORMAT } } : {}),
    }));
    sheet.getRow(1).font = { bold: true };
    rows.forEach((row) => sheet.addRow(row));
  };

  addSheet(
    SHEETS.vocabularies,
    [
      { header: 'Word', key: 'word', width: 20 },
      { header: 'Meaning', key: 'meaning', width: 30 },
      { header: 'Pronunciation', key: 'pronunciation', width: 20 },
      { header: 'Example', key: 'example', width: 40 },
      { header: 'Example Translation', key: 'exampleTranslation', width: 40 },
      { header: 'Note', key: 'note', width: 30 },
      { header: 'Image', key: 'image', width: 50 },
      { header: 'Video', key: 'video', width: 50 },
      { header: 'Audio', key: 'audio', width: 50 },
      { header: 'Difficulty', key: 'difficulty', width: 15 },
      { header: 'Mastery Level', key: 'masteryLevel', width: 15 },
      { header: 'Correct Count', key: 'correctCount', width: 15 },
      { header: 'Incorrect Count', key: 'incorrectCount', width: 15 },
      { header: 'Tags', key: 'tags', width: 30 },
      { header: 'Is Favorite', key: 'isFavorite', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20, date: true },
      { header: 'Is Pinned', key: 'isPinned', width: 12 },
      { header: 'Pinned At', key: 'pinnedAt', width: 20, date: true },
      { header: 'Last Reviewed At', key: 'lastReviewedAt', width: 20, date: true },
      { header: 'Next Review At', key: 'nextReviewAt', width: 20, date: true },
    ],
    snapshot.vocabularies.map((v) => ({
      word: v.word,
      meaning: v.meaning,
      pronunciation: v.pronunciation,
      example: v.example,
      exampleTranslation: v.exampleTranslation,
      note: cap(v.note) || '',
      image: cap(v.image) || '',
      video: cap(v.video) || '',
      audio: cap(v.audio) || '',
      difficulty: v.difficulty,
      masteryLevel: v.masteryLevel,
      correctCount: v.correctCount,
      incorrectCount: v.incorrectCount,
      tags: v.tags ? v.tags.join(',') : '',
      isFavorite: yesNo(v.isFavorite),
      createdAt: asDate(v.createdAt),
      isPinned: yesNo(v.isPinned),
      pinnedAt: asDate(v.pinnedAt),
      lastReviewedAt: asDate(v.lastReviewedAt),
      nextReviewAt: asDate(v.nextReviewAt),
    })),
  );

  addSheet(
    SHEETS.history,
    [
      { header: 'Word', key: 'word', width: 20 },
      { header: 'Type', key: 'practiceType', width: 20 },
      { header: 'Is Correct', key: 'isCorrect', width: 15 },
      { header: 'User Answer', key: 'userAnswer', width: 30 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Time Spent (s)', key: 'timeSpent', width: 15 },
      { header: 'Date', key: 'createdAt', width: 20, date: true },
    ],
    snapshot.histories.map((h) => ({
      word: h.word,
      practiceType: h.practiceType,
      isCorrect: yesNo(h.isCorrect),
      userAnswer: h.userAnswer ?? '',
      score: h.score,
      timeSpent: h.timeSpent,
      createdAt: asDate(h.createdAt),
    })),
  );

  addSheet(
    SHEETS.categories,
    [
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Color', key: 'color', width: 12 },
      { header: 'Icon', key: 'icon', width: 12 },
      { header: 'Is Pinned', key: 'isPinned', width: 12 },
      { header: 'Pinned At', key: 'pinnedAt', width: 20, date: true },
    ],
    snapshot.categories.map((c) => ({
      name: c.name,
      description: cap(c.description) ?? '',
      color: c.color ?? '',
      icon: cap(c.icon) ?? '',
      isPinned: yesNo(c.isPinned),
      pinnedAt: asDate(c.pinnedAt),
    })),
  );
  addSheet(
    SHEETS.categoryWords,
    [
      { header: 'Category', key: 'category', width: 24 },
      { header: 'Word', key: 'word', width: 24 },
    ],
    snapshot.categories.flatMap((c) => c.words.map((word) => ({ category: c.name, word }))),
  );

  addSheet(
    SHEETS.tags,
    [
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Color', key: 'color', width: 12 },
    ],
    snapshot.tags.map((t) => ({
      name: t.name,
      description: cap(t.description) ?? '',
      color: t.color ?? '',
    })),
  );

  addSheet(
    SHEETS.dateTopics,
    [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Topic', key: 'topic', width: 36 },
      { header: 'Icon', key: 'icon', width: 12 },
      { header: 'Color', key: 'color', width: 12 },
    ],
    snapshot.dateTopics.map((t) => ({
      date: t.date,
      topic: t.topic,
      icon: cap(t.icon) ?? '',
      color: t.color ?? '',
    })),
  );

  addSheet(
    SHEETS.tabs,
    [
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Icon', key: 'icon', width: 30 },
      { header: 'Is Default', key: 'isDefault', width: 12 },
      { header: 'Sort Order', key: 'sortOrder', width: 12 },
    ],
    snapshot.tabs.map((t) => ({
      name: t.name,
      icon: cap(t.icon) ?? '',
      isDefault: yesNo(t.isDefault),
      sortOrder: t.sortOrder,
    })),
  );
  addSheet(
    SHEETS.tabWords,
    [
      { header: 'Tab', key: 'tab', width: 24 },
      { header: 'Word', key: 'word', width: 24 },
    ],
    snapshot.tabs.flatMap((t) => t.words.map((word) => ({ tab: t.name, word }))),
  );

  addSheet(
    SHEETS.srs,
    [
      { header: 'Word', key: 'word', width: 24 },
      { header: 'Repetitions', key: 'repetitions', width: 14 },
      { header: 'Lapses', key: 'lapses', width: 10 },
      { header: 'Ease Factor', key: 'easeFactor', width: 14 },
      { header: 'Interval Days', key: 'intervalDays', width: 14 },
      { header: 'Next Review At', key: 'nextReviewAt', width: 20, date: true },
      { header: 'Last Reviewed At', key: 'lastReviewedAt', width: 20, date: true },
    ],
    snapshot.srsProgress.map((p) => ({
      word: p.word,
      repetitions: p.repetitions,
      lapses: p.lapses,
      easeFactor: p.easeFactor,
      intervalDays: p.intervalDays,
      nextReviewAt: asDate(p.nextReviewAt),
      lastReviewedAt: asDate(p.lastReviewedAt),
    })),
  );
  addSheet(
    SHEETS.srsHistory,
    [
      { header: 'Word', key: 'word', width: 24 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Previous Interval Days', key: 'previousIntervalDays', width: 22 },
      { header: 'Interval Days', key: 'intervalDays', width: 14 },
      { header: 'Next Review At', key: 'nextReviewAt', width: 20, date: true },
      { header: 'Date', key: 'createdAt', width: 20, date: true },
    ],
    snapshot.srsReviews.map((r) => ({
      word: r.word,
      rating: r.rating,
      previousIntervalDays: r.previousIntervalDays,
      intervalDays: r.intervalDays,
      nextReviewAt: asDate(r.nextReviewAt),
      createdAt: asDate(r.createdAt),
    })),
  );

  return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/** Plain text of any cell value: dates, rich text, links and formulas included. */
function cellText(value: CellValue | undefined): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    const v = value as any;
    if (Array.isArray(v.richText)) return v.richText.map((part: any) => part.text ?? '').join('');
    if ('result' in v) return cellText(v.result);
    if (typeof v.text === 'string') return v.text;
    if (typeof v.error === 'string') return '';
  }
  return String(value);
}

interface Row {
  /** True when the sheet has a column with this header. */
  has(header: string): boolean;
  text(header: string, fallbackColumn?: number): string;
  /** Date cells come back as ISO text; empty cells as null. */
  date(header: string, fallbackColumn?: number): string | null;
  yes(header: string, fallbackColumn?: number): boolean;
  int(header: string, fallbackColumn?: number): number;
}

function readRows(sheet: Worksheet | undefined): Row[] {
  if (!sheet) return [];

  const headers = new Map<string, number>();
  sheet.getRow(1).eachCell((cell: Cell, column: number) => {
    const name = cellText(cell.value).trim().toLowerCase();
    if (name && !headers.has(name)) headers.set(name, column);
  });

  const rows: Row[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const column = (header: string, fallback?: number) =>
      headers.get(header.toLowerCase()) ?? fallback;
    const raw = (header: string, fallback?: number): CellValue | undefined => {
      const index = column(header, fallback);
      return index ? row.getCell(index).value : undefined;
    };
    const text = (header: string, fallback?: number) => cellText(raw(header, fallback)).trim();
    rows.push({
      has: (header) => headers.has(header.toLowerCase()),
      text: (header, fallback) => cellText(raw(header, fallback)).trim(),
      date: (header, fallback) => {
        const value = raw(header, fallback);
        if (value === null || value === undefined || value === '') return null;
        const parsed = value instanceof Date ? value : new Date(cellText(value));
        return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
      },
      yes: (header, fallback) => /^(yes|true|1)$/i.test(text(header, fallback)),
      int: (header, fallback) => {
        const n = Math.trunc(Number(text(header, fallback)));
        return Number.isFinite(n) ? n : 0;
      },
    });
  });
  return rows;
}

const orNull = (value: string): string | null => (value ? value : null);

/** A date column that must stay `YYYY-MM-DD` even if Excel turned it into a real date. */
function readDateOnly(row: Row, header: string): string {
  const value = row.text(header);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = row.date(header);
  return parsed ? parsed.slice(0, 10) : '';
}

export async function xlsxBufferToSnapshot(buffer: Buffer): Promise<UserDataSnapshot> {
  const ExcelJS = require('exceljs') as typeof import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const snapshot = emptySnapshot();

  // Vocabularies: the fallback numbers are the fixed positions older exports used.
  for (const row of readRows(workbook.getWorksheet(SHEETS.vocabularies))) {
    const word = row.text('Word', 1);
    if (!word) continue;
    const tags = row.text('Tags', 14);
    snapshot.vocabularies.push({
      word,
      meaning: row.text('Meaning', 2),
      pronunciation: row.text('Pronunciation', 3),
      example: row.text('Example', 4),
      exampleTranslation: row.text('Example Translation', 5),
      note: row.text('Note', 6),
      image: orNull(row.text('Image', 7)),
      video: orNull(row.text('Video', 8)),
      audio: orNull(row.text('Audio', 9)),
      difficulty: row.text('Difficulty', 10).toLowerCase() || 'easy',
      masteryLevel: row.text('Mastery Level', 11).toLowerCase() || 'new',
      correctCount: row.int('Correct Count', 12),
      incorrectCount: row.int('Incorrect Count', 13),
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
      isFavorite: row.yes('Is Favorite', 15),
      createdAt: row.date('Created At', 16) ?? new Date().toISOString(),
      // Left undefined when the column is absent so old files change nothing.
      isPinned: row.has('Is Pinned') ? row.yes('Is Pinned') : undefined,
      pinnedAt: row.has('Pinned At') ? row.date('Pinned At') : undefined,
      lastReviewedAt: row.has('Last Reviewed At') ? row.date('Last Reviewed At') : undefined,
      nextReviewAt: row.has('Next Review At') ? row.date('Next Review At') : undefined,
    });
  }

  for (const row of readRows(workbook.getWorksheet(SHEETS.history))) {
    const word = row.text('Word', 1);
    if (!word) continue;
    snapshot.histories.push({
      word,
      practiceType: row.text('Type', 2) || 'flashcard',
      isCorrect: row.yes('Is Correct', 3),
      userAnswer: row.text('User Answer', 4),
      score: row.int('Score', 5),
      timeSpent: row.int('Time Spent (s)', 6),
      createdAt: row.date('Date', 7) ?? new Date().toISOString(),
    });
  }

  const categories = new Map<string, SnapshotCategory>();
  const categoryOf = (name: string): SnapshotCategory => {
    const key = name.toLowerCase();
    let category = categories.get(key);
    if (!category) {
      category = {
        name,
        description: null,
        color: null,
        icon: null,
        isPinned: false,
        pinnedAt: null,
        words: [],
      };
      categories.set(key, category);
    }
    return category;
  };
  for (const row of readRows(workbook.getWorksheet(SHEETS.categories))) {
    const name = row.text('Name');
    if (!name) continue;
    const category = categoryOf(name);
    category.description = orNull(row.text('Description'));
    category.color = orNull(row.text('Color'));
    category.icon = orNull(row.text('Icon'));
    category.isPinned = row.yes('Is Pinned');
    category.pinnedAt = row.date('Pinned At');
  }
  for (const row of readRows(workbook.getWorksheet(SHEETS.categoryWords))) {
    const name = row.text('Category');
    const word = row.text('Word');
    if (name && word) categoryOf(name).words.push(word);
  }
  snapshot.categories = Array.from(categories.values());

  for (const row of readRows(workbook.getWorksheet(SHEETS.tags))) {
    const name = row.text('Name');
    if (!name) continue;
    snapshot.tags.push({
      name,
      description: orNull(row.text('Description')),
      color: orNull(row.text('Color')),
    });
  }

  for (const row of readRows(workbook.getWorksheet(SHEETS.dateTopics))) {
    const date = readDateOnly(row, 'Date');
    const topic = row.text('Topic');
    if (!date || !topic) continue;
    snapshot.dateTopics.push({
      date,
      topic,
      icon: orNull(row.text('Icon')),
      color: orNull(row.text('Color')),
    });
  }

  const tabs = new Map<string, SnapshotTab>();
  const tabOf = (name: string): SnapshotTab => {
    const key = name.toLowerCase();
    let tab = tabs.get(key);
    if (!tab) {
      tab = { name, icon: null, isDefault: false, sortOrder: tabs.size + 1, words: [] };
      tabs.set(key, tab);
    }
    return tab;
  };
  for (const row of readRows(workbook.getWorksheet(SHEETS.tabs))) {
    const name = row.text('Name');
    if (!name) continue;
    const tab = tabOf(name);
    tab.icon = orNull(row.text('Icon'));
    tab.isDefault = row.yes('Is Default');
    tab.sortOrder = row.int('Sort Order') || tab.sortOrder;
  }
  for (const row of readRows(workbook.getWorksheet(SHEETS.tabWords))) {
    const name = row.text('Tab');
    const word = row.text('Word');
    if (name && word) tabOf(name).words.push(word);
  }
  snapshot.tabs = Array.from(tabs.values());

  for (const row of readRows(workbook.getWorksheet(SHEETS.srs))) {
    const word = row.text('Word');
    if (!word) continue;
    snapshot.srsProgress.push({
      word,
      repetitions: row.int('Repetitions'),
      lapses: row.int('Lapses'),
      easeFactor: Number(row.text('Ease Factor')) || 2.5,
      intervalDays: row.int('Interval Days'),
      nextReviewAt: row.date('Next Review At') ?? new Date().toISOString(),
      lastReviewedAt: row.date('Last Reviewed At'),
    });
  }
  for (const row of readRows(workbook.getWorksheet(SHEETS.srsHistory))) {
    const word = row.text('Word');
    if (!word) continue;
    snapshot.srsReviews.push({
      word,
      rating: row.text('Rating').toLowerCase(),
      previousIntervalDays: row.int('Previous Interval Days'),
      intervalDays: row.int('Interval Days'),
      nextReviewAt: row.date('Next Review At') ?? new Date().toISOString(),
      createdAt: row.date('Date') ?? new Date().toISOString(),
    });
  }

  return snapshot;
}
