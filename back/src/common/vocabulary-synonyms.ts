import { BadRequestException } from '@nestjs/common';
import { PartOfSpeech } from '../entities/vocabulary.entity';

export interface VocabularySynonym {
  word: string;
  pronunciation?: string;
  meaning?: string;
  partOfSpeech?: PartOfSpeech;
}
const key = (text: string) => text.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();

export function normalizeSynonyms(raw: unknown, mainWord: string): VocabularySynonym[] {
  if (raw == null) return [];
  if (!Array.isArray(raw) || raw.length > 20) throw new BadRequestException('At most 20 synonyms are allowed');
  const seen = new Set([key(mainWord)]);
  const result: VocabularySynonym[] = [];
  for (const item of raw) {
    if (!item || typeof item.word !== 'string' || (item.pronunciation != null && typeof item.pronunciation !== 'string')) throw new BadRequestException('Invalid synonym');
    if (item.meaning != null && typeof item.meaning !== 'string') throw new BadRequestException('Invalid synonym meaning');
    const meaning = (item.meaning ?? '').trim();
    if (meaning.length > 500) throw new BadRequestException('Synonym meaning is too long');
    const word = item.word.trim().replace(/\s+/gu, ' ');
    const pronunciation = (item.pronunciation ?? '').trim();
    if (!word || word.length > 120 || pronunciation.length > 200) throw new BadRequestException('Invalid synonym word or pronunciation');
    if (item.partOfSpeech != null && !Object.values(PartOfSpeech).includes(item.partOfSpeech)) throw new BadRequestException('Invalid synonym part of speech');
    if (seen.has(key(word))) continue;
    seen.add(key(word));
    result.push({ word, pronunciation, ...(meaning ? { meaning } : {}), ...(item.partOfSpeech != null ? { partOfSpeech: item.partOfSpeech } : {}) });
  }
  return result;
}
