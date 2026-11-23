import { EntityManager } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CategoryDateTopic } from '../../entities/category-date-topic.entity';
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
  pronunciation: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  note: string;
  image: string | null;
  video: string | null;
  audio: string | null;
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
  practiceType: string;
  isCorrect: boolean;
  userAnswer: string | null;
  score: number;
  timeSpent: number;
  createdAt: string;
}

export interface SnapshotCategory {
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isPinned: boolean;
  pinnedAt: string | null;
  words: string[];
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
}

export interface SnapshotSrsProgress {
  word: string;
  repetitions: number;
  lapses: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
}

export interface SnapshotSrsReview {
  word: string;
  rating: string;
  previousIntervalDays: number;
  intervalDays: number;
  nextReviewAt: string;
  createdAt: string;
}

export interface UserDataSnapshot {
  vocabularies: SnapshotVocabulary[];
  histories: SnapshotHistory[];
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
}

export const emptySnapshot = (): UserDataSnapshot => ({
  vocabularies: [],
  histories: [],
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
});

/** Accepts older or hand-made payloads: every list may be missing. */
export const normalizeSnapshot = (raw: unknown): UserDataSnapshot => {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const list = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
  return {
    vocabularies: list(source.vocabularies),
    histories: list(source.histories),
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

const historyKey = (
  vocabularyId: string,
  practiceType: string,
  score: number,
  timeSpent: number,
) => `${vocabularyId}|${practiceType}|${score}|${timeSpent}`;

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
  const vocabularies: SnapshotVocabulary[] = [];
  const seenWords = new Set<string>();
  for (const v of vocabRows) {
    const word = clean(v.word);
    if (!word) continue;
    wordById.set(v.id, word);
    if (seenWords.has(word)) continue;
    seenWords.add(word);
    vocabularies.push({
      word,
      pronunciation: v.pronunciation || '',
      meaning: v.meaning || '',
      example: v.example || '',
      exampleTranslation: v.exampleTranslation || '',
      note: v.note || '',
      image: media(v.image, mediaMax),
      video: media(v.video, mediaMax),
      audio: media(v.audio, mediaMax),
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
      practiceType: h.practiceType,
      isCorrect: !!h.isCorrect,
      userAnswer: h.userAnswer ?? null,
      score: h.score,
      timeSpent: h.timeSpent,
      createdAt: iso(h.createdAt) ?? new Date().toISOString(),
    });
  }

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
  // Only copy what the source really has, so an older file cannot reset them.
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
): Promise<MergeStats> {
  const snapshot = normalizeSnapshot(raw);
  const stats = emptyMergeStats();

  // ----- Words ------------------------------------------------------------
  const vocabRepo = manager.getRepository(Vocabulary);
  const existingWords = await vocabRepo.find(
    mode === 'import'
      ? { where: { userId } }
      : { where: { userId }, select: { id: true, word: true } },
  );
  const byWord = new Map<string, Vocabulary>();
  for (const row of existingWords) {
    const key = clean(row.word);
    if (key && !byWord.has(key)) byWord.set(key, row);
  }

  const created = new Set<string>();
  const toCreate: Vocabulary[] = [];
  const seenWords = new Set<string>();
  for (const shared of snapshot.vocabularies) {
    const word = clean(shared?.word);
    if (!word || seenWords.has(word)) continue;
    seenWords.add(word);

    const fields = vocabularyFields(shared);
    const existing = byWord.get(word);
    if (existing) {
      if (mode === 'import' && vocabularyChanged(existing, fields)) {
        await vocabRepo.update(existing.id, fields as any);
        stats.updatedVocabularies++;
      } else {
        stats.skippedVocabularies++;
      }
      continue;
    }
    toCreate.push(vocabRepo.create({ userId, word, ...fields } as any) as unknown as Vocabulary);
  }
  if (toCreate.length > 0) {
    await vocabRepo.save(toCreate, { chunk: 200 });
    for (const row of toCreate) {
      byWord.set(row.word, row);
      created.add(row.word);
    }
    stats.newVocabularies = toCreate.length;
  }

  /** The words this merge is allowed to attach other data to. */
  const canAttach = (word: string) =>
    mode === 'import' ? byWord.has(word) : created.has(word);
  const idsOf = (words: unknown): string[] => {
    const out: string[] = [];
    for (const w of Array.isArray(words) ? words : []) {
      const word = clean(w);
      const row = word ? byWord.get(word) : undefined;
      if (row && canAttach(word)) out.push(row.id);
    }
    return out;
  };

  // ----- Practice history -------------------------------------------------
  const historyRepo = manager.getRepository(PracticeHistory);
  const historyKeys = new Set<string>();
  if (mode === 'import' && snapshot.histories.length > 0) {
    const known = await historyRepo.find({
      where: { userId },
      select: { vocabularyId: true, practiceType: true, score: true, timeSpent: true },
    });
    for (const h of known) {
      historyKeys.add(historyKey(h.vocabularyId, h.practiceType, h.score, h.timeSpent));
    }
  }
  const historyRows: PracticeHistory[] = [];
  for (const shared of snapshot.histories) {
    const word = clean(shared?.word);
    const row = word ? byWord.get(word) : undefined;
    if (!row || !canAttach(word) || !PRACTICE_TYPES.has(shared.practiceType)) continue;
    const score = toCount(shared.score);
    const timeSpent = toCount(shared.timeSpent);
    const key = historyKey(row.id, shared.practiceType, score, timeSpent);
    if (historyKeys.has(key)) continue;
    historyKeys.add(key);
    historyRows.push(
      historyRepo.create({
        userId,
        vocabularyId: row.id,
        practiceType: shared.practiceType as PracticeType,
        isCorrect: !!shared.isCorrect,
        userAnswer: (shared.userAnswer == null ? null : String(shared.userAnswer)) as any,
        score,
        timeSpent,
        createdAt: toDate(shared.createdAt),
      }),
    );
  }
  if (historyRows.length > 0) {
    await historyRepo.save(historyRows, { chunk: 500 });
    stats.newHistories = historyRows.length;
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
    const word = clean(shared?.word);
    if (!word || !canAttach(word) || !Array.isArray(shared.tags)) continue;
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
        await categoryRepo.update(category.id, patch);
        stats.updatedOthers++;
      }
    }
    stats.linkedWords += await linkWords(
      manager,
      Category,
      'vocabularies',
      category.id,
      idsOf(shared.words),
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
        await tabRepo.update(tab.id, { icon });
        stats.updatedOthers++;
      }
    }
    stats.linkedWords += await linkWords(
      manager,
      VocabularyTab,
      'vocabularies',
      tab.id,
      idsOf(shared.words),
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
    const word = clean(shared?.word);
    const row = word ? byWord.get(word) : undefined;
    if (!row || !canAttach(word)) continue;

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
    const word = clean(shared?.word);
    const row = word ? byWord.get(word) : undefined;
    if (!row || !canAttach(word) || !SRS_RATINGS.has(shared.rating)) continue;
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
