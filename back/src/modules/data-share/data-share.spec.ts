import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { DataShare } from '../../entities/data-share.entity';
import { PracticeHistory, PracticeType } from '../../entities/practice-history.entity';
import { User } from '../../entities/user.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { UserRepository } from '../auth/repositories/user.repository';
import { DataShareService } from './services/data-share.service';

describe('Sharing vocabulary data with another account', () => {
  let database: DataSource;
  let service: DataShareService;
  let gateway: { emitToUser: jest.Mock; emitVocabularyByDateRefresh: jest.Mock };
  let alice: User;
  let bob: User;
  let carol: User;

  const vocabularies = () => database.getRepository(Vocabulary);
  const wordsOf = async (userId: string) =>
    (await vocabularies().find({ where: { userId } })).map((v) => v.word).sort();

  beforeAll(async () => {
    database = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [join(__dirname, '../../entities/*.entity.ts')],
      synchronize: true,
      logging: false,
    });
    await database.initialize();

    gateway = { emitToUser: jest.fn(), emitVocabularyByDateRefresh: jest.fn() };
    service = new DataShareService(
      database.getRepository(DataShare),
      database.getRepository(User),
      new UserRepository(database.getRepository(User)),
      database,
      gateway as any,
      { sendShareNotice: jest.fn().mockResolvedValue(undefined) } as any,
    );

    const users = database.getRepository(User);
    alice = await users.save(users.create({ fullName: 'Alice', email: 'alice@example.com' }));
    bob = await users.save(users.create({ fullName: 'Bob', email: 'bob@example.com' }));
    carol = await users.save(users.create({ fullName: 'Carol', email: 'carol@example.com' }));

    const apple = await vocabularies().save(
      vocabularies().create({ userId: alice.id, word: 'apple', meaning: 'apple meaning', pronunciation: '/a/' }),
    );
    await vocabularies().save(
      vocabularies().create({ userId: alice.id, word: 'book', meaning: 'book meaning', pronunciation: '/b/' }),
    );
    await vocabularies().save(
      vocabularies().create({ userId: bob.id, word: 'book', meaning: "bob's own meaning", pronunciation: '/b/' }),
    );
    const histories = database.getRepository(PracticeHistory);
    await histories.save(
      histories.create({
        userId: alice.id,
        vocabularyId: apple.id,
        practiceType: PracticeType.FLASHCARD,
        isCorrect: true,
        score: 10,
        timeSpent: 3,
      }),
    );
  });

  afterAll(async () => {
    if (database?.isInitialized) await database.destroy();
  });

  it('rejects unknown emails, yourself and senders with nothing to share', async () => {
    await expect(service.create(alice.id, 'nobody@example.com')).rejects.toThrow(
      new NotFoundException('EMAIL_NOT_FOUND'),
    );
    await expect(service.create(alice.id, 'ALICE@example.com')).rejects.toThrow(
      new BadRequestException('CANNOT_SHARE_SELF'),
    );
    await expect(service.create(carol.id, 'bob@example.com')).rejects.toThrow(
      new BadRequestException('NO_DATA_TO_SHARE'),
    );
  });

  let shareId: string;

  it('creates a pending offer, notifies only the recipient and writes nothing yet', async () => {
    const created = await service.create(alice.id, ' Bob@Example.com ');
    shareId = created.id;
    expect(created.status).toBe('pending');
    expect(gateway.emitToUser).toHaveBeenCalledWith(
      bob.id,
      'data-share:received',
      expect.objectContaining({ id: shareId, vocabularyCount: 2 }),
    );
    expect(await wordsOf(bob.id)).toEqual(['book']);
    await expect(service.create(alice.id, 'bob@example.com')).rejects.toThrow(
      new ConflictException('ALREADY_PENDING'),
    );
  });

  it('lists the offer for the recipient only, without the data itself', async () => {
    const incoming = await service.listIncoming(bob.id);
    expect(incoming).toHaveLength(1);
    expect(incoming[0]).toMatchObject({
      id: shareId,
      sender: { fullName: 'Alice', email: 'alice@example.com' },
      vocabularyCount: 2,
    });
    expect(JSON.stringify(incoming)).not.toContain('payload');
    expect(await service.listIncoming(alice.id)).toEqual([]);
  });

  it('does not let a third party or the sender answer the offer', async () => {
    await expect(service.accept(carol.id, shareId)).rejects.toThrow(NotFoundException);
    await expect(service.accept(alice.id, shareId)).rejects.toThrow(NotFoundException);
    await expect(service.reject(carol.id, shareId)).rejects.toThrow(NotFoundException);
  });

  it('merges only new words on accept, keeps existing ones and counts words', async () => {
    const result = await service.accept(bob.id, shareId);
    expect(result.stats).toMatchObject({ newVocabularies: 1, skippedVocabularies: 1, newHistories: 1 });
    expect(await wordsOf(bob.id)).toEqual(['apple', 'book']);

    const bobBook = await vocabularies().findOneByOrFail({ userId: bob.id, word: 'book' });
    expect(bobBook.meaning).toBe("bob's own meaning");

    const histories = await database.getRepository(PracticeHistory).find({ where: { userId: bob.id } });
    expect(histories).toHaveLength(1);

    expect((await database.getRepository(User).findOneByOrFail({ id: bob.id })).totalWords).toBe(2);
    expect(gateway.emitToUser).toHaveBeenCalledWith(
      alice.id,
      'data-share:responded',
      expect.objectContaining({ id: shareId, status: 'accepted' }),
    );
  });

  it('cannot be accepted twice', async () => {
    await expect(service.accept(bob.id, shareId)).rejects.toThrow(
      new ConflictException('SHARE_ALREADY_HANDLED'),
    );
    expect(await wordsOf(bob.id)).toEqual(['apple', 'book']);
  });

  it('lets the recipient decline without importing anything', async () => {
    const second = await service.create(alice.id, 'carol@example.com');
    await service.reject(carol.id, second.id);
    expect(await wordsOf(carol.id)).toEqual([]);
    expect(gateway.emitToUser).toHaveBeenCalledWith(
      alice.id,
      'data-share:responded',
      expect.objectContaining({ id: second.id, status: 'rejected' }),
    );
    await expect(service.accept(carol.id, second.id)).rejects.toThrow(ConflictException);
  });

  it('lets the sender cancel a pending offer so the dialog can close', async () => {
    const third = await service.create(alice.id, 'carol@example.com');
    await expect(service.cancel(carol.id, third.id)).rejects.toThrow(NotFoundException);
    await service.cancel(alice.id, third.id);
    expect(gateway.emitToUser).toHaveBeenCalledWith(carol.id, 'data-share:cancelled', {
      id: third.id,
    });
  });

  it('treats offers older than 7 days as expired', async () => {
    const fourth = await service.create(alice.id, 'carol@example.com');
    await database
      .getRepository(DataShare)
      .update({ id: fourth.id }, { createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) });
    expect(await service.listIncoming(carol.id)).toEqual([]);
    await expect(service.accept(carol.id, fourth.id)).rejects.toThrow(/SHARE_EXPIRED/);
  });
});
