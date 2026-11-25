import { BadRequestException, ConflictException } from '@nestjs/common';
import { PartOfSpeech, Vocabulary } from '../../../entities/vocabulary.entity';
import type { Repository } from 'typeorm';

export const normalizeIdentity = (value: string | null | undefined) =>
  (value ?? '').normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();

type Identity = {
  word: string;
  meaning?: string;
  partOfSpeech?: PartOfSpeech | null;
};
type Match = Pick<Vocabulary, 'id' | 'word' | 'meaning' | 'partOfSpeech'>;

export async function checkVocabularyIdentity(
  repo: Repository<Vocabulary>,
  userId: string,
  input: Identity,
  excludeId?: string,
) {
  const key = normalizeIdentity(input.word);
  if (!key) return { duplicate: false, total: 0, matches: [] as Match[] };
  const meaning = normalizeIdentity(input.meaning);
  const part = input.partOfSpeech ?? PartOfSpeech.UNSPECIFIED;
  const rows = await repo.find({
    where: { userId },
    select: { id: true, word: true, meaning: true, partOfSpeech: true },
  });
  const matches = rows.filter(
    (row) => row.id !== excludeId && normalizeIdentity(row.word) === key,
  );
  const isDuplicate = (row: Match) =>
    !!meaning &&
    normalizeIdentity(row.meaning) === meaning &&
    (row.partOfSpeech === part ||
      row.partOfSpeech === PartOfSpeech.UNSPECIFIED ||
      part === PartOfSpeech.UNSPECIFIED);
  matches.sort(
    (a, b) =>
      Number(isDuplicate(b)) - Number(isDuplicate(a)) ||
      a.id.localeCompare(b.id),
  );
  return {
    duplicate: matches.some(isDuplicate),
    total: matches.length,
    matches: matches.slice(0, 5),
  };
}

export async function assertVocabularyIdentity(
  repo: Repository<Vocabulary>,
  userId: string,
  input: Identity,
  previous?: Match,
) {
  // Do not prevent unrelated edits to pre-existing duplicate records.
  if (
    previous &&
    normalizeIdentity(previous.word) === normalizeIdentity(input.word) &&
    normalizeIdentity(previous.meaning) === normalizeIdentity(input.meaning) &&
    previous.partOfSpeech === (input.partOfSpeech ?? PartOfSpeech.UNSPECIFIED)
  )
    return;
  if (!normalizeIdentity(input.word) || !normalizeIdentity(input.meaning))
    throw new BadRequestException('Word and meaning are required');
  const result = await checkVocabularyIdentity(
    repo,
    userId,
    input,
    previous?.id,
  );
  if (result.duplicate)
    throw new ConflictException({
      code: 'VOCABULARY_DUPLICATE',
      message: 'This word, meaning and part of speech already exist.',
      ...result,
    });
}
