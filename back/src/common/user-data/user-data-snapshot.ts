import { normalizeSynonyms } from '../vocabulary-synonyms';
import { EntityManager } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CategoryDateTopic } from '../../entities/category-date-topic.entity';
import { History, HistoryAction } from '../../entities/history.entity';
import { User } from '../../entities/user.entity';
import {
  PracticeHistory,
  PracticeType,
} from '../../entities/practice-history.entity';
import { SrsProgress } from '../../entities/srs-progress.entity';
import { SrsReview } from '../../entities/srs-review.entity';
import { Tag } from '../../entities/tag.entity';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import {
  DifficultyLevel,
  MasteryLevel,
  PartOfSpeech,
  Vocabulary,
} from '../../entities/vocabulary.entity';

/**
 * One portable copy of everything a person sees in the app: words, practice
 * history, categories, tags, "by learning date" topics, tabs and Smart review.
 *
 * Rows from different accounts never share ids, so everything that points at a
 * word does it by the word itself. The same snapshot feeds the Excel export,
 * the Excel import and "send to email", so the three can never drift apart.
 */
export interface SnapshotVocabulary {
  word: string;
  entryKey?: string;
  partOfSpeech?: string;
  synonyms?: import('../vocabulary-synonyms').VocabularySynonym[];
  selectedSynonym?: string | null;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  note: string;
  image: string | null;
  video: string | null;
  audio: string | null;
  backgroundUrl?: string | null;
  animatedBackground?: string | null;
  difficulty: string;
  masteryLevel: string;
  correctCount: number;
  incorrectCount: number;
  tags: string[] | null;
  isFavorite: boolean;
  createdAt: string;
  // Optional: files exported before these existed must not overwrite anything.
  isPinned?: boolean;
  pinnedAt?: string | null;
  lastReviewedAt?: string | null;
  nextReviewAt?: string | null;
}

export interface SnapshotHistory {
  word: string;
  entryKey?: string;
  practiceType: string;
  isCorrect: boolean;
  userAnswer: string | null;
  score: number;
  timeSpent: number;
  createdAt: string;
}

export interface SnapshotActivity {
  word?: string;
  entryKey?: string;
  action: HistoryAction;
  metadata: History['metadata'] | null;
  description: string | null;
  createdAt: string;
}

export interface SnapshotPreferences {
  theme?: string;
  vocabularyLayout?: User['vocabularyLayout'];
  preferredVoiceKey?: string | null;
  seasonalThemesEnabled?: boolean;
}

export interface SnapshotCategory {
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isPinned: boolean;
  pinnedAt: string | null;
  words: string[];
  entryKeys?: string[];
}

export interface SnapshotTag {
  name: string;
  description: string | null;
  color: string | null;
}

export interface SnapshotDateTopic {
  date: string;
  topic: string;
  icon: string | null;
  color: string | null;
}

export interface SnapshotTab {
  name: string;
  icon: string | null;
  isDefault: boolean;
  sortOrder: number;
  words: string[];
  entryKeys?: string[];
}

export interface SnapshotSrsProgress {
  word: string;
  entryKey?: string;
  repetitions: number;
  lapses: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
}

export interface SnapshotSrsReview {
  word: string;
  entryKey?: string;
  rating: string;
  previousIntervalDays: number;
  intervalDays: number;
  nextReviewAt: string;
  createdAt: string;
}

export interface UserDataSnapshot {
  vocabularies: SnapshotVocabulary[];
  histories: SnapshotHistory[];
  activities: SnapshotActivity[];
  preferences?: SnapshotPreferences;
  categories: SnapshotCategory[];
  tags: SnapshotTag[];
  dateTopics: SnapshotDateTopic[];
  tabs: SnapshotTab[];
  srsProgress: SnapshotSrsProgress[];
  srsReviews: SnapshotSrsReview[];
}

/** How many of each extra kind of data a snapshot carries (shown to the recipient). */
export interface SnapshotSummary {
  categories: number;
  tags: number;
  dateTopics: number;
  tabs: number;
  srs: number;
  srsReviews: number;
  activities: number;
}

export const emptySnapshot = (): UserDataSnapshot => ({
  vocabularies: [],
  histories: [],
  activities: [],
  categories: [],
  tags: [],
  dateTopics: [],
  tabs: [],
  srsProgress: [],
  srsReviews: [],
});

export const summarizeSnapshot = (s: UserDataSnapshot): SnapshotSummary => ({
  categories: s.categories.length,
  tags: s.tags.length,
  dateTopics: s.dateTopics.length,
  tabs: s.tabs.length,
  srs: s.srsProgress.length,
  srsReviews: s.srsReviews.length,
  activities: s.activities.length,
});

/** Accepts older or hand-made payloads: every list may be missing. */
export const normalizeSnapshot = (raw: unknown): UserDataSnapshot => {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const list = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
  return {
    vocabularies: list(source.vocabularies),
    histories: list(source.histories),
    activities: list(source.activities),
    preferences: source.preferences && typeof source.preferences === 'object'
      ? source.preferences as SnapshotPreferences
      : undefined,
    categories: list(source.categories),
    tags: list(source.tags),
    dateTopics: list(source.dateTopics),
    tabs: list(source.tabs),
    srsProgress: list(source.srsProgress),
    srsReviews: list(source.srsReviews),
  };
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const DIFFICULTIES = new Set<string>(Object.values(DifficultyLevel));
const MASTERIES = new Set<string>(Object.values(MasteryLevel));
const PRACTICE_TYPES = new Set<string>(Object.values(PracticeType));
const HISTORY_ACTIONS = new Set<string>(Object.values(HistoryAction));
const SRS_RATINGS = new Set<string>(['again', 'hard', 'good', 'easy']);

const MEDIA_MAX_ON_MERGE = 32000;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const clean = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();

const norm = (value: unknown): string => clean(value).toLowerCase();

const str = (value: unknown): string => (value == null ? '' : String(value));

const optionalText = (value: unknown): string | null => {
  const text = clean(value);
  return text ? text : null;
};

const toCount = (value: unknown): number => {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const toDate = (value: unknown): Date => {
  const d = value ? new Date(value as string) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

const toDateOrNull = (value: unknown): Date | null => {
  if (value == null || value === '') return null;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d;
};

const iso = (value: unknown): string | null => {
  if (value == null || value === '') return null;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const timeOf = (value: unknown): number | null => {
  const d = toDateOrNull(value);
  return d ? d.getTime() : null;
};

const media = (value: unknown, max: number): string | null =>
  typeof value === 'string' && value.length > 0 && value.length <= max ? value : null;

const blankToNull = (value: unknown) => (value === '' || value === undefined ? null : value);

const chunked = <T>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const practiceKey = (row: PracticeHistory) => JSON.stringify([
  row.vocabularyId, row.practiceType, timeOf(row.createdAt), row.score,
  row.timeSpent, row.isCorrect, row.userAnswer ?? '',
]);

const activityKey = (row: History) => JSON.stringify([
  row.vocabularyId ?? null, row.action, timeOf(row.createdAt),
  row.description ?? '', row.metadata ?? null,
]);

// Matching a count preserves legitimate repeated events with the same fields.
function existingOccurrences<T>(rows: T[], keyOf: (row: T) => string) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = keyOf(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return (row: T) => {
    const key = keyOf(row);
    const count = counts.get(key) ?? 0;
    if (!count) return false;
    counts.set(key, count - 1);
    return true;
  };
}

/** Table and column names of a many-to-many link, read from TypeORM itself. */
function junctionOf(manager: EntityManager, entity: Function, property: string) {
  const relation = manager.connection
    .getMetadata(entity)
    .findRelationWithPropertyPath(property);
  if (!relation) throw new Error(`Missing relation ${property}`);
  const owner = relation.isOwning ? relation : relation.inverseRelation;
  if (!owner) throw new Error(`Missing owner of relation ${property}`);
  const ownerColumn = owner.joinColumns[0].databaseName;
  const inverseColumn = owner.inverseJoinColumns[0].databaseName;
  return {
    table: owner.joinTableName,
    // column holding the id of `entity` itself / of the vocabulary
    entityColumn: relation.isOwning ? ownerColumn : inverseColumn,
    vocabularyColumn: relation.isOwning ? inverseColumn : ownerColumn,
  };
}

/** Adds the missing (owner, word) links and returns how many were new. */
async function linkWords(
  manager: EntityManager,
  entity: Function,
  property: string,
  ownerId: string,
  vocabularyIds: string[],
): Promise<number> {
  const unique = Array.from(new Set(vocabularyIds));
  if (unique.length === 0) return 0;
  const link = junctionOf(manager, entity, property);

  const present: Array<Record<string, string>> = await manager.query(
    `SELECT "${link.vocabularyColumn}" AS vid FROM "${link.table}" WHERE "${link.entityColumn}" = ?`,
    [ownerId],
  );
  const known = new Set(present.map((row) => row.vid));
  const missing = unique.filter((id) => !known.has(id));

  for (const part of chunked(missing, 200)) {
    const placeholders = part.map(() => '(?, ?)').join(', ');
    await manager.query(
      `INSERT OR IGNORE INTO "${link.table}" ("${link.entityColumn}", "${link.vocabularyColumn}") VALUES ${placeholders}`,
      part.flatMap((vid) => [ownerId, vid]),
    );
  }
  return missing.length;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

export interface BuildOptions {
  maxVocabularies?: number;
  maxHistories?: number;
  maxReviews?: number;
  preferences?: SnapshotPreferences;
  /** Longer media values (e.g. base64 images) are left out of the copy. */
  mediaMaxLength?: number;
  historyOrder?: 'ASC' | 'DESC';
}

export interface BuildResult {
  snapshot: UserDataSnapshot;
  /** True when the account has more words than `maxVocabularies`. */
  overLimit: boolean;
}

export async function buildUserDataSnapshot(
  manager: EntityManager,
  userId: string,
  options: BuildOptions = {},
): Promise<BuildResult> {
  const mediaMax = options.mediaMaxLength ?? Number.MAX_SAFE_INTEGER;

  // Every list is loaded with its own query. Joining several one-to-many
  // relations at once multiplies the rows and used to exhaust the heap.
  const vocabRows = await manager.getRepository(Vocabulary).find({
    where: { userId },
    order: { createdAt: 'ASC' },
    take: options.maxVocabularies ? options.maxVocabularies + 1 : undefined,
  });
  if (options.maxVocabularies && vocabRows.length > options.maxVocabularies) {
    return { snapshot: emptySnapshot(), overLimit: true };
  }

  const wordById = new Map<string, string>();
  const entryById = new Map<string, string>();
  const vocabularies: SnapshotVocabulary[] = [];
  for (const v of vocabRows) {
    const word = clean(v.word);
    if (!word) continue;
    wordById.set(v.id, word);
    entryById.set(v.id, v.id);
    vocabularies.push({
      word,
      entryKey: v.id,
      partOfSpeech: v.partOfSpeech,
      synonyms: v.synonyms ?? [],
      selectedSynonym: v.selectedSynonym ?? null,
      pronunciation: v.pronunciation || '',
      meaning: v.meaning || '',
      example: v.example || '',
      exampleTranslation: v.exampleTranslation || '',
      note: v.note || '',
      image: media(v.image, mediaMax),
      video: media(v.video, mediaMax),
      audio: media(v.audio, mediaMax),
      backgroundUrl: media(v.backgroundUrl, mediaMax),
      animatedBackground: media(v.animatedBackground, mediaMax),
      difficulty: v.difficulty,
      masteryLevel: v.masteryLevel,
      correctCount: v.correctCount,
      incorrectCount: v.incorrectCount,
      tags: v.tags && v.tags.length > 0 ? v.tags : null,
      isFavorite: !!v.isFavorite,
      createdAt: iso(v.createdAt) ?? new Date().toISOString(),
      isPinned: !!v.isPinned,
      pinnedAt: iso(v.pinnedAt),
      lastReviewedAt: iso(v.lastReviewedAt),
      nextReviewAt: iso(v.nextReviewAt),
    });
  }
  const wordsOf = (ids: Array<{ id: string }> | undefined): string[] =>
    Array.from(
      new Set(
        (ids ?? [])
          .map((row) => wordById.get(row.id))
          .filter((word): word is string => !!word),
      ),
    );

  const entriesOf = (rows: Array<{id: string}> | undefined) => (rows ?? []).map(row => entryById.get(row.id)).filter((key): key is string => !!key);

  const historyRows = await manager.getRepository(PracticeHistory).find({
    where: { userId },
    order: { createdAt: options.historyOrder ?? 'ASC' },
    take: options.maxHistories,
  });
  const histories: SnapshotHistory[] = [];
  for (const h of historyRows) {
    const word = wordById.get(h.vocabularyId);
    if (!word) continue;
    histories.push({
      word,
      entryKey: entryById.get(h.vocabularyId),
      practiceType: h.practiceType,
      isCorrect: !!h.isCorrect,
      userAnswer: h.userAnswer ?? null,
      score: h.score,
      timeSpent: h.timeSpent,
      createdAt: iso(h.createdAt) ?? new Date().toISOString(),
    });
  }

  const activityRows = await manager.getRepository(History).find({
    where: { userId },
    order: { createdAt: options.historyOrder ?? 'ASC', id: 'ASC' },
    take: options.maxHistories,
  });
  const activities: SnapshotActivity[] = activityRows.map((entry) => ({
    word: wordById.get(entry.vocabularyId),
    entryKey: entryById.get(entry.vocabularyId),
    action: entry.action,
    metadata: entry.metadata ?? null,
    description: entry.description ?? null,
    createdAt: entry.createdAt.toISOString(),
  }));

  const categoryRows = await manager
    .getRepository(Category)
    .createQueryBuilder('c')
    .leftJoin('c.vocabularies', 'v')
    .addSelect(['v.id'])
    .where('c.userId = :userId', { userId })
    .orderBy('c.createdAt', 'ASC')
    .getMany();
  const categories: SnapshotCategory[] = categoryRows
    .filter((c) => clean(c.name))
    .map((c) => ({
      name: clean(c.name),
      description: c.description ?? null,
      color: c.color ?? null,
      icon: c.icon ?? null,
      isPinned: !!c.isPinned,
      pinnedAt: iso(c.pinnedAt),
      words: wordsOf(c.vocabularies),
      entryKeys: entriesOf(c.vocabularies),
    }));

  const tagRows = await manager.getRepository(Tag).find({
    where: { userId },
    order: { createdAt: 'ASC' },
  });
  const tags: SnapshotTag[] = tagRows
    .filter((t) => clean(t.name))
    .map((t) => ({
      name: clean(t.name),
      description: t.description ?? null,
      color: t.color ?? null,
    }));

  const topicRows = await manager.getRepository(CategoryDateTopic).find({
    where: { userId },
    order: { date: 'ASC' },
  });
  const dateTopics: SnapshotDateTopic[] = topicRows
    .filter((t) => DATE_ONLY.test(clean(t.date)) && clean(t.topic))
    .map((t) => ({
      date: clean(t.date),
      topic: clean(t.topic),
      icon: t.icon ?? null,
      color: t.color ?? null,
    }));

  const tabRows = await manager
    .getRepository(VocabularyTab)
    .createQueryBuilder('t')
    .leftJoin('t.vocabularies', 'v')
    .addSelect(['v.id'])
    .where('t.userId = :userId', { userId })
    .orderBy('t.sortOrder', 'ASC')
    .getMany();
  const tabs: SnapshotTab[] = tabRows
    .filter((t) => clean(t.name))
    .map((t) => ({
      name: clean(t.name),
      icon: t.icon ?? null,
      isDefault: !!t.isDefault,
      sortOrder: t.sortOrder ?? 0,
      words: wordsOf(t.vocabularies),
      entryKeys: entriesOf(t.vocabularies),
    }));

  const progressRows = await manager.getRepository(SrsProgress).find({
    where: { userId },
    order: { createdAt: 'ASC' },
  });
  const srsProgress: SnapshotSrsProgress[] = [];
  for (const p of progressRows) {
    const word = wordById.get(p.vocabularyId);
    if (!word) continue;
    srsProgress.push({
      word,
      entryKey: entryById.get(p.vocabularyId),
      repetitions: p.repetitions,
      lapses: p.lapses,
      easeFactor: p.easeFactor,
      intervalDays: p.intervalDays,
      nextReviewAt: iso(p.nextReviewAt) ?? new Date().toISOString(),
      lastReviewedAt: iso(p.lastReviewedAt),
    });
  }

  const reviewRows = await manager.getRepository(SrsReview).find({
    where: { userId },
    order: { createdAt: options.historyOrder ?? 'ASC' },
    take: options.maxReviews,
  });
  const srsReviews: SnapshotSrsReview[] = [];
  for (const r of reviewRows) {
    const word = wordById.get(r.vocabularyId);
    if (!word) continue;
    srsReviews.push({
      word,
      entryKey: entryById.get(r.vocabularyId),
      rating: r.rating,
      previousIntervalDays: r.previousIntervalDays,
      intervalDays: r.intervalDays,
      nextReviewAt: iso(r.nextReviewAt) ?? new Date().toISOString(),
      createdAt: iso(r.createdAt) ?? new Date().toISOString(),
    });
  }

  return {
    snapshot: {
      vocabularies,
      histories,
      activities,
      preferences: options.preferences,
      categories,
      tags,
      dateTopics,
      tabs,
      srsProgress,
      srsReviews,
    },
    overLimit: false,
  };
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

/**
 * share:  the data comes from someone else. Nothing the person already has is
 *         changed, and everything that belongs to a word (history, categories,
 *         tabs, Smart review) is only attached to words this merge created.
 * import: the person's own backup. Words that changed are updated and every
 *         link is restored, but nothing is ever deleted.
 */
export type MergeMode = 'share' | 'import';

export interface MergeStats {
  newVocabularies: number;
  updatedVocabularies: number;
  skippedVocabularies: number;
  newHistories: number;
  newActivities: number;
  updatedPreferences: number;
  newCategories: number;
  newTags: number;
  newDateTopics: number;
  newTabs: number;
  newSrsProgress: number;
  newSrsReviews: number;
  /** Word-to-category and word-to-tab links that were added. */
  linkedWords: number;
  /** Existing categories, tags, topics, tabs or Smart review rows that were updated. */
  updatedOthers: number;
}

export const emptyMergeStats = (): MergeStats => ({
  newVocabularies: 0,
  updatedVocabularies: 0,
  skippedVocabularies: 0,
  newHistories: 0,
  newActivities: 0,
  updatedPreferences: 0,
  newCategories: 0,
  newTags: 0,
  newDateTopics: 0,
  newTabs: 0,
  newSrsProgress: 0,
  newSrsReviews: 0,
  linkedWords: 0,
  updatedOthers: 0,
});

/** Everything that actually changed (skipped words are not a change). */
export const mergeChangeCount = (s: MergeStats): number =>
  s.newVocabularies +
  s.updatedVocabularies +
  s.newHistories +
  s.newActivities +
  s.updatedPreferences +
  s.newCategories +
  s.newTags +
  s.newDateTopics +
  s.newTabs +
  s.newSrsProgress +
  s.newSrsReviews +
  s.linkedWords +
  s.updatedOthers;

function vocabularyFields(shared: SnapshotVocabulary): Record<string, any> {
  const tags = Array.isArray(shared.tags)
    ? shared.tags.map((t) => clean(t)).filter(Boolean)
    : [];
  const fields: Record<string, any> = {
    pronunciation: str(shared.pronunciation),
    meaning: str(shared.meaning),
    example: str(shared.example),
    exampleTranslation: str(shared.exampleTranslation),
    note: str(shared.note),
    image: media(shared.image, MEDIA_MAX_ON_MERGE),
    video: media(shared.video, MEDIA_MAX_ON_MERGE),
    audio: media(shared.audio, MEDIA_MAX_ON_MERGE),
    difficulty: DIFFICULTIES.has(shared.difficulty) ? shared.difficulty : DifficultyLevel.EASY,
    masteryLevel: MASTERIES.has(shared.masteryLevel) ? shared.masteryLevel : MasteryLevel.NEW,
    correctCount: toCount(shared.correctCount),
    incorrectCount: toCount(shared.incorrectCount),
    tags: tags.length > 0 ? tags : null,
    isFavorite: !!shared.isFavorite,
    createdAt: toDate(shared.createdAt),
  };
  if (shared.backgroundUrl !== undefined) fields.backgroundUrl = media(shared.backgroundUrl, MEDIA_MAX_ON_MERGE);
  if (shared.animatedBackground !== undefined) fields.animatedBackground = media(shared.animatedBackground, MEDIA_MAX_ON_MERGE);
  if (shared.synonyms !== undefined) fields.synonyms = normalizeSynonyms(shared.synonyms, shared.word);
  // Only copy what the source really has, so an older file cannot reset them.
  if (shared.partOfSpeech && Object.values(PartOfSpeech).includes(shared.partOfSpeech as PartOfSpeech)) fields.partOfSpeech = shared.partOfSpeech;
  if (shared.isPinned !== undefined) fields.isPinned = !!shared.isPinned;
  if (shared.pinnedAt !== undefined) fields.pinnedAt = toDateOrNull(shared.pinnedAt);
  if (shared.lastReviewedAt !== undefined) fields.lastReviewedAt = toDateOrNull(shared.lastReviewedAt);
  if (shared.nextReviewAt !== undefined) fields.nextReviewAt = toDateOrNull(shared.nextReviewAt);
  return fields;
}

function vocabularyChanged(existing: Vocabulary, fields: Record<string, any>): boolean {
  const same = (a: unknown, b: unknown) => blankToNull(a) === blankToNull(b);
  const tagsOf = (value: unknown) =>
    Array.isArray(value) && value.length > 0 ? JSON.stringify(value) : null;

  if (
    !same(existing.meaning, fields.meaning) ||
    !same(existing.pronunciation, fields.pronunciation) ||
    !same(existing.example, fields.example) ||
    !same(existing.exampleTranslation, fields.exampleTranslation) ||
    !same(existing.note, fields.note) ||
    !same(existing.image, fields.image) ||
    !same(existing.video, fields.video) ||
    !same(existing.audio, fields.audio) ||
    existing.difficulty !== fields.difficulty ||
    existing.masteryLevel !== fields.masteryLevel ||
    existing.correctCount !== fields.correctCount ||
    existing.incorrectCount !== fields.incorrectCount ||
    tagsOf(existing.tags) !== tagsOf(fields.tags) ||
    !!existing.isFavorite !== fields.isFavorite
  ) {
    return true;
  }
  if ('backgroundUrl' in fields && !same(existing.backgroundUrl, fields.backgroundUrl)) return true;
  if ('animatedBackground' in fields && !same(existing.animatedBackground, fields.animatedBackground)) return true;
  if ('selectedSynonym' in fields && (existing.selectedSynonym ?? null) !== fields.selectedSynonym) return true;
  if ('synonyms' in fields && JSON.stringify(existing.synonyms ?? []) !== JSON.stringify(fields.synonyms)) return true;
  if ('partOfSpeech' in fields && existing.partOfSpeech !== fields.partOfSpeech) return true;
  if ('isPinned' in fields && !!existing.isPinned !== fields.isPinned) return true;
  if ('pinnedAt' in fields && timeOf(existing.pinnedAt) !== timeOf(fields.pinnedAt)) return true;
  if ('lastReviewedAt' in fields && timeOf(existing.lastReviewedAt) !== timeOf(fields.lastReviewedAt)) return true;
  if ('nextReviewAt' in fields && timeOf(existing.nextReviewAt) !== timeOf(fields.nextReviewAt)) return true;
  return false;
}

export async function mergeUserDataSnapshot(
  manager: EntityManager,
  userId: string,
  raw: unknown,
  mode: MergeMode,
  replacedUploads: unknown[] = [],
): Promise<MergeStats> {
  const snapshot = normalizeSnapshot(raw);
  const stats = emptyMergeStats();

  // ----- Words ------------------------------------------------------------
  const vocabRepo = manager.getRepository(Vocabulary);
  const existingWords = await vocabRepo.find({ where: { userId } });
  const normalize = (value: unknown) => clean(value).normalize('NFKC').replace(/\s+/gu, ' ').toLowerCase();
  const bySpelling = new Map<string, Vocabulary[]>();
  const remember = (row: Vocabulary) => {
    const key = normalize(row.word);
    const entries = bySpelling.get(key) ?? [];
    entries.push(row);
    bySpelling.set(key, entries);
  };
  for (const row of existingWords) remember(row);

  const byEntry = new Map<string, Vocabulary>();
  const byLegacyWord = new Map<string, Vocabulary>();
  const ambiguousLegacy = new Set<string>();
  const created = new Set<Vocabulary>();
  const toCreate: Vocabulary[] = [];
  for (const shared of snapshot.vocabularies) {
    const word = clean(shared?.word);
    if (!word) continue;
    const entryKey = clean(shared.entryKey);
    if (entryKey && byEntry.has(entryKey)) continue;
    const fields = vocabularyFields(shared);
    const part = fields.partOfSpeech ?? PartOfSpeech.UNSPECIFIED;
    const candidates = bySpelling.get(normalize(word)) ?? [];
    const exact = candidates.find(row => normalize(row.meaning) === normalize(fields.meaning) &&
      (row.partOfSpeech === part || row.partOfSpeech === PartOfSpeech.UNSPECIFIED || part === PartOfSpeech.UNSPECIFIED));
    let existing = exact;
    // Legacy files did not distinguish senses. Do not guess when ambiguous.
    if (!existing && part === PartOfSpeech.UNSPECIFIED && !entryKey && candidates.length === 1) existing = candidates[0];
    // Preserve the existing share policy for unclassified words.
    if (!existing && mode === 'share' && part === PartOfSpeech.UNSPECIFIED && candidates.length === 1 && !created.has(candidates[0]!) && candidates[0]!.partOfSpeech === PartOfSpeech.UNSPECIFIED) existing = candidates[0];
    if (!existing && part === PartOfSpeech.UNSPECIFIED && !entryKey && candidates.length > 1) {
      stats.skippedVocabularies++;
      continue;
    }
    if (shared.selectedSynonym !== undefined || fields.synonyms !== undefined) {
      const candidate = shared.selectedSynonym !== undefined ? shared.selectedSynonym : existing?.selectedSynonym;
      const available = fields.synonyms ?? existing?.synonyms ?? [];
      fields.selectedSynonym = available.find(item => item.word === candidate)?.word ?? null;
    }
    if (existing && mode === 'import' && !created.has(existing)) {
      if (part === PartOfSpeech.UNSPECIFIED && existing.partOfSpeech !== PartOfSpeech.UNSPECIFIED) delete fields.partOfSpeech;
      if (vocabularyChanged(existing, fields)) {
        for (const field of ['image', 'video', 'audio', 'backgroundUrl', 'animatedBackground'] as const) {
          if (fields[field] !== undefined && fields[field] !== existing[field]) replacedUploads.push(existing[field]);
        }
        await vocabRepo.update(existing.id, fields as any);
        Object.assign(existing, fields);
        stats.updatedVocabularies++;
      } else stats.skippedVocabularies++;
    } else if (existing) stats.skippedVocabularies++;
    else {
      existing = vocabRepo.create({ userId, word, ...fields } as any) as unknown as Vocabulary;
      existing.partOfSpeech = existing.partOfSpeech ?? PartOfSpeech.UNSPECIFIED;
      remember(existing);
      created.add(existing);
      toCreate.push(existing);
    }
    if (entryKey) byEntry.set(entryKey, existing);
    const legacyKey = normalize(word);
    if (byLegacyWord.has(legacyKey) && byLegacyWord.get(legacyKey) !== existing) ambiguousLegacy.add(legacyKey);
    else byLegacyWord.set(legacyKey, existing);
  }
  if (toCreate.length > 0) {
    await vocabRepo.save(toCreate, { chunk: 200 });
    stats.newVocabularies = toCreate.length;
  }

  const resolveWord = (word: unknown, key?: unknown): Vocabulary | undefined => {
    const entryKey = clean(key);
    if (entryKey) return byEntry.get(entryKey);
    const legacyKey = normalize(word);
    if (ambiguousLegacy.has(legacyKey)) return undefined;
    const row = byLegacyWord.get(legacyKey);
    if (row) return row;
    const candidates = bySpelling.get(legacyKey) ?? [];
    return candidates.length === 1 ? candidates[0] : undefined;
  };
  const canAttach = (row: Vocabulary | undefined): row is Vocabulary =>
    !!row && (mode === 'import' || created.has(row));
  const idsOf = (words: unknown, keys?: unknown): string[] => {
    const rows = Array.isArray(keys) && keys.length
      ? keys.map(key => resolveWord('', key))
      : (Array.isArray(words) ? words : []).map(word => resolveWord(word));
    return rows.filter(canAttach).map(row => row.id);
  };

  // ----- Practice history -------------------------------------------------
  const historyRepo = manager.getRepository(PracticeHistory);
  const knownPractice = snapshot.histories.length
    ? await historyRepo.find({ where: { userId } })
    : [];
  const alreadyPracticed = existingOccurrences(knownPractice, practiceKey);
  const historyRows: PracticeHistory[] = [];
  for (const shared of snapshot.histories) {
    const row = resolveWord(shared?.word, shared?.entryKey);
    if (!canAttach(row) || !PRACTICE_TYPES.has(shared.practiceType)) continue;
    const history = historyRepo.create({
      userId,
      vocabularyId: row.id,
      practiceType: shared.practiceType as PracticeType,
      isCorrect: !!shared.isCorrect,
      userAnswer: str(shared.userAnswer),
      score: toCount(shared.score),
      timeSpent: toCount(shared.timeSpent),
      createdAt: toDate(shared.createdAt),
    });
    if (!alreadyPracticed(history)) historyRows.push(history);
  }
  if (historyRows.length > 0) {
    await historyRepo.save(historyRows, { chunk: 500 });
    stats.newHistories = historyRows.length;
  }

  if (snapshot.activities.length > 0) {
    const activityRepo = manager.getRepository(History);
    const knownActivities = await activityRepo.find({ where: { userId } });
    const alreadyLogged = existingOccurrences(knownActivities, activityKey);
    const activityRows: History[] = [];
    for (const entry of snapshot.activities) {
      if (!HISTORY_ACTIONS.has(entry?.action)) continue;
      const createdAt = toDateOrNull(entry.createdAt);
      if (!createdAt) continue;
      const linked = !!(entry.word || entry.entryKey);
      const word = linked ? resolveWord(entry.word, entry.entryKey) : undefined;
      if (linked && !canAttach(word)) continue;
      const history = Object.assign(activityRepo.create(), {
        userId,
        vocabularyId: word?.id ?? null,
        action: entry.action,
        metadata: entry.metadata && typeof entry.metadata === 'object' && !Array.isArray(entry.metadata)
          ? entry.metadata
          : null,
        description: typeof entry.description === 'string' ? entry.description : null,
        createdAt,
      });
      if (!alreadyLogged(history)) activityRows.push(history);
    }
    if (activityRows.length) await activityRepo.save(activityRows, { chunk: 500 });
    stats.newActivities = activityRows.length;
  }

  if (mode === 'import' && snapshot.preferences) {
    const { theme, vocabularyLayout, preferredVoiceKey, seasonalThemesEnabled } = snapshot.preferences;
    const userRepo = manager.getRepository(User);
    const current = await userRepo.findOneByOrFail({ id: userId });
    const changes: SnapshotPreferences = {};
    if ((theme === 'light' || theme === 'dark') && theme !== current.theme) changes.theme = theme;
    if ((vocabularyLayout === 'grid' || vocabularyLayout === 'list') && vocabularyLayout !== current.vocabularyLayout) {
      changes.vocabularyLayout = vocabularyLayout;
    }
    if ((preferredVoiceKey === null || (typeof preferredVoiceKey === 'string' && preferredVoiceKey.length <= 512))
      && preferredVoiceKey !== current.preferredVoiceKey) {
      changes.preferredVoiceKey = preferredVoiceKey;
    }
    if (typeof seasonalThemesEnabled === 'boolean' && seasonalThemesEnabled !== current.seasonalThemesEnabled) {
      changes.seasonalThemesEnabled = seasonalThemesEnabled;
    }
    stats.updatedPreferences = Object.keys(changes).length;
    if (stats.updatedPreferences) await userRepo.update(userId, changes);
  }

  // ----- Tags -------------------------------------------------------------
  const tagRepo = manager.getRepository(Tag);
  const tagByName = new Map<string, Tag>();
  for (const t of await tagRepo.find({ where: { userId } })) {
    tagByName.set(norm(t.name), t);
  }
  const newTags: Tag[] = [];
  const addTag = (name: string, description: string | null, color: string | null) => {
    const key = norm(name);
    if (!key || tagByName.has(key)) return;
    const tag = tagRepo.create({ userId, name, description, color } as any) as unknown as Tag;
    tagByName.set(key, tag);
    newTags.push(tag);
  };
  for (const shared of snapshot.tags) {
    const name = clean(shared?.name);
    if (!name) continue;
    const existing = tagByName.get(norm(name));
    if (existing && !newTags.includes(existing)) {
      if (mode !== 'import') continue;
      const patch: Record<string, any> = {};
      const description = optionalText(shared.description);
      const color = optionalText(shared.color);
      if (description && description !== existing.description) patch.description = description;
      if (color && color !== existing.color) patch.color = color;
      if (Object.keys(patch).length > 0) {
        await tagRepo.update(existing.id, patch);
        stats.updatedOthers++;
      }
      continue;
    }
    addTag(name, optionalText(shared.description), optionalText(shared.color));
  }
  // Tags written on words need a tag row too, or the Tags page would miss them.
  for (const shared of snapshot.vocabularies) {
    if (!canAttach(resolveWord(shared?.word, shared?.entryKey)) || !Array.isArray(shared.tags)) continue;
    for (const name of shared.tags) addTag(clean(name), null, null);
  }
  if (newTags.length > 0) {
    await tagRepo.save(newTags, { chunk: 200 });
    stats.newTags = newTags.length;
  }

  // ----- "By learning date" topics ---------------------------------------
  const topicRepo = manager.getRepository(CategoryDateTopic);
  const topicByDate = new Map<string, CategoryDateTopic>();
  for (const t of await topicRepo.find({ where: { userId } })) {
    topicByDate.set(clean(t.date), t);
  }
  const newTopics: CategoryDateTopic[] = [];
  for (const shared of snapshot.dateTopics) {
    const date = clean(shared?.date);
    const topic = clean(shared?.topic);
    if (!DATE_ONLY.test(date) || !topic) continue;
    const existing = topicByDate.get(date);
    if (existing) {
      if (mode !== 'import') continue;
      const patch: Record<string, any> = {};
      if (topic !== existing.topic) patch.topic = topic;
      const icon = optionalText(shared.icon);
      const color = optionalText(shared.color);
      if (icon && icon !== existing.icon) patch.icon = icon;
      if (color && color !== existing.color) patch.color = color;
      if (Object.keys(patch).length > 0) {
        if (patch.icon !== undefined && patch.icon !== existing.icon) replacedUploads.push(existing.icon);
        await topicRepo.update(existing.id, patch);
        stats.updatedOthers++;
      }
      continue;
    }
    const row = topicRepo.create({
      userId,
      date,
      topic,
      icon: optionalText(shared.icon),
      color: optionalText(shared.color),
    } as any) as unknown as CategoryDateTopic;
    topicByDate.set(date, row);
    newTopics.push(row);
  }
  if (newTopics.length > 0) {
    await topicRepo.save(newTopics, { chunk: 200 });
    stats.newDateTopics = newTopics.length;
  }

  // ----- Categories -------------------------------------------------------
  const categoryRepo = manager.getRepository(Category);
  const categoryByName = new Map<string, Category>();
  for (const c of await categoryRepo.find({ where: { userId } })) {
    categoryByName.set(norm(c.name), c);
  }
  for (const shared of snapshot.categories) {
    const name = clean(shared?.name);
    if (!name) continue;
    let category = categoryByName.get(norm(name));
    if (!category) {
      category = await categoryRepo.save(
        categoryRepo.create({
          userId,
          name,
          description: optionalText(shared.description),
          color: optionalText(shared.color),
          icon: optionalText(shared.icon),
          isPinned: !!shared.isPinned,
          pinnedAt: toDateOrNull(shared.pinnedAt),
        } as any) as unknown as Category,
      );
      categoryByName.set(norm(name), category);
      stats.newCategories++;
    } else if (mode === 'import') {
      const patch: Record<string, any> = {};
      const description = optionalText(shared.description);
      const color = optionalText(shared.color);
      const icon = optionalText(shared.icon);
      if (description && description !== category.description) patch.description = description;
      if (color && color !== category.color) patch.color = color;
      if (icon && icon !== category.icon) patch.icon = icon;
      if (!!shared.isPinned !== !!category.isPinned) {
        patch.isPinned = !!shared.isPinned;
        patch.pinnedAt = toDateOrNull(shared.pinnedAt);
      }
      if (Object.keys(patch).length > 0) {
        if (patch.icon !== undefined && patch.icon !== category.icon) replacedUploads.push(category.icon);
        await categoryRepo.update(category.id, patch);
        stats.updatedOthers++;
      }
    }
    stats.linkedWords += await linkWords(
      manager,
      Category,
      'vocabularies',
      category.id,
      idsOf(shared.words, shared.entryKeys),
    );
  }

  // ----- Tabs -------------------------------------------------------------
  const tabRepo = manager.getRepository(VocabularyTab);
  const tabByName = new Map<string, VocabularyTab>();
  let maxOrder = 0;
  let hasDefaultTab = false;
  for (const t of await tabRepo.find({ where: { userId } })) {
    tabByName.set(norm(t.name), t);
    maxOrder = Math.max(maxOrder, t.sortOrder ?? 0);
    if (t.isDefault) hasDefaultTab = true;
  }
  const orderedTabs = [...snapshot.tabs].sort(
    (a, b) => (Number(a?.sortOrder) || 0) - (Number(b?.sortOrder) || 0),
  );
  for (const shared of orderedTabs) {
    const name = clean(shared?.name);
    if (!name) continue;
    let tab = tabByName.get(norm(name));
    if (!tab) {
      const makeDefault = !!shared.isDefault && !hasDefaultTab;
      tab = await tabRepo.save(
        tabRepo.create({
          userId,
          name,
          icon: optionalText(shared.icon),
          isDefault: makeDefault,
          sortOrder: ++maxOrder,
        } as any) as unknown as VocabularyTab,
      );
      if (makeDefault) hasDefaultTab = true;
      tabByName.set(norm(name), tab);
      stats.newTabs++;
    } else if (mode === 'import') {
      const icon = optionalText(shared.icon);
      if (icon && icon !== tab.icon) {
        replacedUploads.push(tab.icon);
        await tabRepo.update(tab.id, { icon });
        stats.updatedOthers++;
      }
    }
    stats.linkedWords += await linkWords(
      manager,
      VocabularyTab,
      'vocabularies',
      tab.id,
      idsOf(shared.words, shared.entryKeys),
    );
  }

  // ----- Smart review -----------------------------------------------------
  const progressRepo = manager.getRepository(SrsProgress);
  const progressByWord = new Map<string, SrsProgress>();
  for (const p of await progressRepo.find({ where: { userId } })) {
    progressByWord.set(p.vocabularyId, p);
  }
  const newProgress: SrsProgress[] = [];
  for (const shared of snapshot.srsProgress) {
    const row = resolveWord(shared?.word, shared?.entryKey);
    if (!canAttach(row)) continue;

    const values = {
      repetitions: toCount(shared.repetitions),
      lapses: toCount(shared.lapses),
      easeFactor: Number.isFinite(Number(shared.easeFactor)) && Number(shared.easeFactor) > 0
        ? Number(shared.easeFactor)
        : 2.5,
      intervalDays: toCount(shared.intervalDays),
      nextReviewAt: toDate(shared.nextReviewAt),
      lastReviewedAt: toDateOrNull(shared.lastReviewedAt),
    };
    const existing = progressByWord.get(row.id);
    if (!existing) {
      const created = progressRepo.create({
        userId,
        vocabularyId: row.id,
        ...values,
      } as any) as unknown as SrsProgress;
      progressByWord.set(row.id, created);
      newProgress.push(created);
    } else if (mode === 'import') {
      // Keep whichever copy was reviewed most recently.
      const incoming = timeOf(values.lastReviewedAt);
      const current = timeOf(existing.lastReviewedAt);
      if (incoming !== null && (current === null || incoming > current)) {
        await progressRepo.update(existing.id, values as any);
        stats.updatedOthers++;
      }
    }
  }
  if (newProgress.length > 0) {
    await progressRepo.save(newProgress, { chunk: 200 });
    stats.newSrsProgress = newProgress.length;
  }

  const reviewRepo = manager.getRepository(SrsReview);
  const reviewKeys = new Set<string>();
  const reviewKey = (vocabularyId: string, rating: string, at: unknown) =>
    `${vocabularyId}|${rating}|${timeOf(at)}`;
  if (mode === 'import' && snapshot.srsReviews.length > 0) {
    const known = await reviewRepo.find({
      where: { userId },
      select: { vocabularyId: true, rating: true, createdAt: true },
    });
    for (const r of known) reviewKeys.add(reviewKey(r.vocabularyId, r.rating, r.createdAt));
  }
  const newReviews: SrsReview[] = [];
  for (const shared of snapshot.srsReviews) {
    const row = resolveWord(shared?.word, shared?.entryKey);
    if (!canAttach(row) || !SRS_RATINGS.has(shared.rating)) continue;
    const key = reviewKey(row.id, shared.rating, shared.createdAt);
    if (reviewKeys.has(key)) continue;
    reviewKeys.add(key);
    newReviews.push(
      reviewRepo.create({
        userId,
        vocabularyId: row.id,
        rating: shared.rating,
        previousIntervalDays: toCount(shared.previousIntervalDays),
        intervalDays: toCount(shared.intervalDays),
        nextReviewAt: toDate(shared.nextReviewAt),
        createdAt: toDate(shared.createdAt),
      } as any) as unknown as SrsReview,
    );
  }
  if (newReviews.length > 0) {
    await reviewRepo.save(newReviews, { chunk: 500 });
    stats.newSrsReviews = newReviews.length;
  }

  return stats;
}
