import { join } from 'path';
import { DataSource } from 'typeorm';
import { Vocabulary, PartOfSpeech } from '../../../entities/vocabulary.entity';
import { User } from '../../../entities/user.entity';
import { Category } from '../../../entities/category.entity';
import { CategoryDateTopic } from '../../../entities/category-date-topic.entity';
import { VocabularyRepository } from './vocabulary.repository';
import { AddVocabularyPartOfSpeech1795800000000 } from '../../../migrations/1795800000000-AddVocabularyPartOfSpeech';
import { validate } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { UpdateVocabularyDto } from '../dto/update-vocabulary.dto';
import { plainToInstance } from 'class-transformer';
import { CreateVocabularyDto } from '../dto/create-vocabulary.dto';

describe('Vocabulary identity and word classification', () => {
  let db: DataSource;
  let repo: VocabularyRepository;
  let a: User, b: User;
  const word = (
    userId: string,
    word = 'book',
    meaning = 'sach',
    partOfSpeech = PartOfSpeech.NOUN,
  ) => ({ userId, word, meaning, partOfSpeech, pronunciation: '/buk/' });
  beforeAll(async () => {
    db = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [join(__dirname, '../../../entities/*.entity.ts')],
      synchronize: true,
    });
    await db.initialize();
    const users = db.getRepository(User);
    a = await users.save(users.create({ fullName: 'A' }));
    b = await users.save(users.create({ fullName: 'B' }));
    repo = new VocabularyRepository(
      db.getRepository(Vocabulary),
      db.getRepository(Category),
      db.getRepository(CategoryDateTopic),
    );
  });
  afterAll(async () => {
    if (db?.isInitialized) await db.destroy();
  });
  it('checks normalized spelling, meaning and part; allows another account and distinct senses', async () => {
    const first = await repo.create(word(a.id));
    expect(first.partOfSpeech).toBe(PartOfSpeech.NOUN);
    await expect(
      repo.create(word(a.id, ' BOOK ', ' SACH ')),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      repo.create(word(a.id, 'book', 'reserve', PartOfSpeech.VERB)),
    ).resolves.toMatchObject({ partOfSpeech: 'verb' });
    await expect(
      repo.create(word(a.id, 'book', 'volume')),
    ).resolves.toBeDefined();
    await expect(repo.create(word(b.id))).resolves.toBeDefined();
    const result = await repo.checkDuplicate(a.id, {
      word: 'BOOK',
      meaning: 'sach',
      partOfSpeech: PartOfSpeech.NOUN,
    });
    expect(result.duplicate).toBe(true);
    expect(result.total).toBe(3);
    expect(
      (
        await repo.checkDuplicate(a.id, {
          word: 'book',
          meaning: 'sach',
          partOfSpeech: PartOfSpeech.NOUN,
          excludeId: first.id,
        })
      ).duplicate,
    ).toBe(false);
    expect(
      (
        await repo.findAllPaginated(
          a.id,
          1,
          10,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          PartOfSpeech.VERB,
        )
      ).items,
    ).toHaveLength(1);
  });
  it('rejects concurrent duplicate writes and edits into another identity', async () => {
    const both = await Promise.allSettled([
      repo.create(word(a.id, 'test')),
      repo.create(word(a.id, ' TEST ')),
    ]);
    expect(both.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
    const other = await repo.create(word(a.id, 'another'));
    await expect(
      repo.update(other.id, a.id, { word: 'test' }),
    ).rejects.toMatchObject({ status: 409 });
    expect((await repo.findById(other.id, a.id))?.word).toBe('another');
    await expect(
      repo.update(other.id, a.id, { example: 'example' }),
    ).resolves.toMatchObject({ word: 'another' });
  });
  it('preserves legacy unclassified entries, permits classification, and validates enum', async () => {
    const legacy = await repo.create({
      userId: a.id,
      word: 'legacy',
      meaning: 'old',
      pronunciation: '/test/',
    });
    expect(legacy.partOfSpeech).toBe(PartOfSpeech.UNSPECIFIED);
    await expect(
      repo.create(word(a.id, 'legacy', 'old')),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      repo.update(legacy.id, a.id, { partOfSpeech: PartOfSpeech.ADJECTIVE }),
    ).resolves.toMatchObject({ partOfSpeech: 'adjective' });
    expect(
      await validate(
        plainToInstance(CreateVocabularyDto, {
          word: 'x',
          meaning: 'y',
          pronunciation: 'z',
          partOfSpeech: 'invalid',
        }),
      ),
    ).toHaveLength(1);
  });
  it('accepts note-only HTTP DTOs without erasing omitted vocabulary fields', async () => {
    const pipe = new ValidationPipe({ whitelist: true, transform: true });
    const updateDto = (body: object) =>
      pipe.transform(body, { type: 'body', metatype: UpdateVocabularyDto });
    const entry = await repo.create({
      ...word(a.id, 'note-regression', 'meaning', PartOfSpeech.VERB),
      example: 'example',
      image: '/uploads/example.png',
    });
    const noteOnly = await updateDto({ note: '423432' });
    const result = await repo.update(entry.id, a.id, noteOnly);
    expect(result).toMatchObject({
      word: entry.word,
      meaning: entry.meaning,
      pronunciation: entry.pronunciation,
      partOfSpeech: entry.partOfSpeech,
      example: 'example',
      image: '/uploads/example.png',
      note: '423432',
    });
    expect(
      await repo.update(entry.id, a.id, await updateDto({ note: '' })),
    ).toMatchObject({ note: '', word: entry.word, meaning: entry.meaning });
    expect(
      await repo.update(
        entry.id,
        a.id,
        await updateDto({ backgroundUrl: 'test-background' }),
      ),
    ).toMatchObject({
      backgroundUrl: 'test-background',
      partOfSpeech: entry.partOfSpeech,
    });
    await expect(
      repo.update(entry.id, a.id, await updateDto({ meaning: ' ' })),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      repo.update(
        entry.id,
        a.id,
        await updateDto({ word: 'book', meaning: 'reserve' }),
      ),
    ).rejects.toMatchObject({ status: 409 });
    expect(
      await repo.update(entry.id, b.id, await updateDto({ note: 'not mine' })),
    ).toBeNull();
    expect(await repo.findById(entry.id, a.id)).toMatchObject({
      note: '',
      word: entry.word,
      meaning: entry.meaning,
    });
  });
  it('migration adds a default without deleting legacy records and is idempotent', async () => {
    const old = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
    });
    await old.initialize();
    const runner = old.createQueryRunner();
    try {
      await runner.query('CREATE TABLE vocabularies (id text, word text)');
      await runner.query("INSERT INTO vocabularies VALUES ('1','old')");
      const migration = new AddVocabularyPartOfSpeech1795800000000();
      await migration.up(runner);
      await migration.up(runner);
      expect(await runner.query('SELECT * FROM vocabularies')).toEqual([
        { id: '1', word: 'old', partOfSpeech: 'unspecified' },
      ]);
    } finally {
      await runner.release();
      await old.destroy();
    }
  });
  it('stores normalized synonyms, searches aliases, preserves them on partial edits and clears explicitly', async () => {
    const entry = await repo.create({...word(a.id,'rapid','fast',PartOfSpeech.ADJECTIVE), synonyms:[{word:' quick ',pronunciation:' /kw\u026ak/ '},{word:'QUICK'},{word:'rapid'},{word:'swift',partOfSpeech:PartOfSpeech.VERB}]});
    expect(entry.synonyms).toEqual([{word:'quick',pronunciation:'/kwɪk/'},{word:'swift',pronunciation:'',partOfSpeech:PartOfSpeech.VERB}]);
    expect((await repo.findAllPaginated(a.id,1,10,'quick')).items.map(x=>x.id)).toContain(entry.id);
    expect((await repo.findAllPaginated(b.id,1,10,'quick')).items).toHaveLength(0);
    const updated=await repo.update(entry.id,a.id,{note:'new note'});
    expect(updated?.synonyms).toEqual(entry.synonyms);
    await expect(repo.update(entry.id,a.id,{synonyms:[{word:'swift',partOfSpeech:'invalid' as PartOfSpeech}]})).rejects.toMatchObject({status:400});
    await expect(repo.update(entry.id,a.id,{synonyms:[{word:''}]})).rejects.toMatchObject({status:400});
    await expect(repo.update(entry.id,a.id,{synonyms:Array.from({length:21},(_,i)=>({word:'alias'+i}))})).rejects.toMatchObject({status:400});
    expect((await repo.update(entry.id,a.id,{word:'quick'}))?.synonyms).toEqual([{word:'swift',pronunciation:'',partOfSpeech:PartOfSpeech.VERB}]);
    expect((await repo.update(entry.id,a.id,{synonyms:[]}))?.synonyms).toEqual([]);
  });
  it('persists a display selection without changing the canonical word or modification date', async () => {
    const entry = await repo.create({...word(a.id,'selection-original','test selection',PartOfSpeech.NOUN), synonyms:[{word:'chosen',partOfSpeech:PartOfSpeech.VERB},{word:'another'}]});
    expect(await repo.selectSynonym(entry.id,a.id,'chosen')).toEqual({id:entry.id,selectedSynonym:'chosen'});
    const persisted=await repo.findById(entry.id,a.id);
    expect(persisted).toMatchObject({word:entry.word,partOfSpeech:PartOfSpeech.NOUN,selectedSynonym:'chosen',updatedAt:entry.updatedAt});
    await expect(repo.selectSynonym(entry.id,b.id,'another')).rejects.toMatchObject({status:404});
    await expect(repo.selectSynonym(entry.id,a.id,'unknown')).rejects.toMatchObject({status:400});
    expect((await repo.update(entry.id,a.id,{note:'preserved'}))?.selectedSynonym).toBe('chosen');
    expect((await repo.update(entry.id,a.id,{synonyms:[{word:'CHOSEN'},{word:'another'}]}))?.selectedSynonym).toBe('CHOSEN');
    expect((await repo.update(entry.id,a.id,{synonyms:[{word:'another'}]}))?.selectedSynonym).toBeNull();
    await repo.selectSynonym(entry.id,a.id,'another');
    expect(await repo.selectSynonym(entry.id,a.id,null)).toEqual({id:entry.id,selectedSynonym:null});
    expect((await repo.findById(entry.id,a.id))?.selectedSynonym).toBeNull();
  });
  it('stores individual synonym meanings and preserves inherited meanings', async () => {
    const entry=await repo.create({...word(a.id,'meaning-original','original meaning',PartOfSpeech.NOUN),synonyms:[{word:'meaning-alias',meaning:'  specific-definition  '},{word:'meaning-inherited',meaning:'  '}]});
    expect(entry.synonyms).toEqual([{word:'meaning-alias',pronunciation:'',meaning:'specific-definition'},{word:'meaning-inherited',pronunciation:''}]);
    expect((await repo.findAllPaginated(a.id,1,10,'specific-definition')).items.map(x=>x.id)).toContain(entry.id);
    expect((await repo.findAllPaginated(b.id,1,10,'specific-definition')).items).toHaveLength(0);
    await repo.selectSynonym(entry.id,a.id,'meaning-alias');
    expect((await repo.findById(entry.id,a.id))?.selectedSynonym).toBe('meaning-alias');
    expect((await repo.update(entry.id,a.id,{note:'partial edit'}))?.synonyms).toEqual(entry.synonyms);
    await expect(repo.update(entry.id,a.id,{synonyms:[{word:'meaning-alias',meaning:123 as any}]})).rejects.toMatchObject({status:400});
    await expect(repo.update(entry.id,a.id,{synonyms:[{word:'meaning-alias',meaning:'x'.repeat(501)}]})).rejects.toMatchObject({status:400});
    const updated=await repo.update(entry.id,a.id,{synonyms:[{word:'meaning-alias',meaning:'changed meaning'}]});
    expect(updated).toMatchObject({word:'meaning-original',meaning:'original meaning',selectedSynonym:'meaning-alias',synonyms:[{word:'meaning-alias',meaning:'changed meaning',pronunciation:''}]});
  });
});
