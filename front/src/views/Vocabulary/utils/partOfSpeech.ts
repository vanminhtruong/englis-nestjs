export const PARTS_OF_SPEECH = [
  'unspecified', 'noun', 'verb', 'adjective', 'adverb', 'pronoun',
  'preposition', 'conjunction', 'determiner', 'interjection', 'numeral',
  'auxiliary', 'phrase', 'phrasal_verb', 'idiom',
] as const
export type PartOfSpeech = typeof PARTS_OF_SPEECH[number]
export function partOfSpeechOptions(t: (key: string) => string) {
  return PARTS_OF_SPEECH.map(value => ({ value, label: t('vocabulary.pos_' + value) }))
}
