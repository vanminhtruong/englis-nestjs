export type SrsRating = "again" | "hard" | "good" | "easy";

export interface SrsCard {
  id: string;
  word: string;
  partOfSpeech?: import('../Vocabulary/utils/partOfSpeech').PartOfSpeech;
  synonyms?: import('../Vocabulary/utils/synonyms').VocabularySynonym[];
  pronunciation: string | null;
  meaning: string;
  example: string | null;
  exampleTranslation: string | null;
  note: string | null;
  image: string | null;
  audio: string | null;
  isNew: boolean;
  isPracticeOnly: boolean;
  repetitions: number;
  lapses: number;
  intervalDays: number;
  nextReviewAt: string | null;
}

export interface SrsOverview {
  totalWords: number;
  newWords: number;
  learningWords: number;
  masteredWords: number;
  dueWords: number;
  availableWords: number;
  reviewed24h: number;
  nextReviewAt: string | null;
}

export interface SrsUpcoming {
  vocabularyId: string;
  word: string;
  partOfSpeech?: import('../Vocabulary/utils/partOfSpeech').PartOfSpeech;
  synonyms?: import('../Vocabulary/utils/synonyms').VocabularySynonym[];
  meaning: string;
  nextReviewAt: string;
  intervalDays: number;
  isDue: boolean;
}

export interface SrsHistory {
  meaning?: string;
  id: string;
  vocabularyId: string;
  word: string;
  partOfSpeech?: import('../Vocabulary/utils/partOfSpeech').PartOfSpeech;
  synonyms?: import('../Vocabulary/utils/synonyms').VocabularySynonym[];
  rating: SrsRating;
  isPracticeOnly: boolean;
  reviewedAt: string;
  nextReviewAt: string;
}

export interface SrsPage<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
}

export interface SrsReviewResult {
  vocabularyId: string;
  rating: SrsRating;
  repetitions: number;
  lapses: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: string;
}
