import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { UploadService } from './upload.service';
import { cleanupUnusedUploads, managedUploadPath } from './unused-upload';
import { VocabularyRepository } from '../../modules/vocabulary/repositories/vocabulary.repository';
import { VocabularyTabService } from '../../modules/vocabulary-tab/vocabulary-tab.service';
import { VocabularyController } from '../../modules/vocabulary/vocabulary.controller';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import { Category } from '../../entities/category.entity';
import { CategoryDateTopic } from '../../entities/category-date-topic.entity';
import { User } from '../../entities/user.entity';
import { UserBackground } from '../../entities/user-background.entity';
import { DataShare } from '../../entities/data-share.entity';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLTTAAAAABJRU5ErkJggg==', 'base64');
const imageData = 'data:image/png;base64,' + png.toString('base64');
const local = (url: string) => join(process.cwd(), url.slice(1));

describe('Upload lifecycle', () => {
  let db: DataSource;
  let uploads: UploadService;
  let words: VocabularyRepository;
  let tabs: VocabularyTabService;
  let a: User, b: User;
  const created = new Set<string>();
  const track = (path: string) => { created.add(path); return path; };
  const newImage = async () => track(await uploads.saveBase64Image(imageData));
  beforeAll(async () => {
    db = new DataSource({ type: 'better-sqlite3', database: ':memory:', entities: [join(__dirname, '../../entities/*.entity.ts')], synchronize: true });
    await db.initialize();
    uploads = new UploadService(db);
    words = new VocabularyRepository(db.getRepository(Vocabulary), db.getRepository(Category), db.getRepository(CategoryDateTopic));
    tabs = new VocabularyTabService(db.getRepository(VocabularyTab), db.getRepository(Vocabulary), uploads);
    const users = db.getRepository(User);
    a = await users.save(users.create({ fullName: 'Upload test A' }));
    b = await users.save(users.create({ fullName: 'Upload test B' }));
  });
  afterAll(async () => {
    for (const path of created) if (existsSync(local(path))) rmSync(local(path));
    if (db?.isInitialized) await db.destroy();
  });
  const addWord = (userId: string, word: string, image: string) => words.create({ userId, word, meaning: word, pronunciation: '/test/', image });
  it('replaces and clears images without deleting unchanged files on partial edits', async () => {
    const old = await newImage();
    const next = await newImage();
    const word = await addWord(a.id, 'replace-test', old);
    await words.update(word.id, a.id, { note: 'changed' });
    expect(existsSync(local(old))).toBe(true);
    await words.update(word.id, a.id, { image: next });
    expect(existsSync(local(old))).toBe(false);
    expect(existsSync(local(next))).toBe(true);
    expect((await words.findById(word.id, a.id))?.image).toBe(next);
    await words.update(word.id, a.id, { image: '' });
    expect(existsSync(local(next))).toBe(false);
  });
  it('keeps shared images until the last live reference is removed', async () => {
    const shared = await newImage();
    const first = await addWord(a.id, 'shared-a', shared);
    const second = await addWord(b.id, 'shared-b', shared);
    await words.update(first.id, a.id, { image: '' });
    expect(existsSync(local(shared))).toBe(true);
    await words.update(second.id, b.id, { image: '' });
    expect(existsSync(local(shared))).toBe(false);
  });
  it('protects pending shares and library backgrounds', async () => {
    const shared = await newImage();
    const word = await addWord(a.id, 'pending-share', shared);
    const shares = db.getRepository(DataShare);
    const share = await shares.save(shares.create({ senderId: a.id, recipientId: b.id, recipientEmail: 'test@example.invalid', status: 'pending', payload: JSON.stringify({ vocabularies: [{ image: shared }] }) }));
    await words.update(word.id, a.id, { image: '' });
    expect(existsSync(local(shared))).toBe(true);
    await shares.update(share.id, { status: 'cancelled' });
    await cleanupUnusedUploads(db.manager, [shared]);
    expect(existsSync(local(shared))).toBe(false);

    const bg = track(await uploads.saveUserBackground({ buffer: png, mimetype: 'image/png' }));
    const library = db.getRepository(UserBackground);
    await library.save(library.create({ userId: a.id, name: 'Library', url: bg }));
    await words.update(word.id, a.id, { backgroundUrl: bg });
    await words.update(word.id, a.id, { backgroundUrl: null });
    expect(existsSync(local(bg))).toBe(true);
  });
  it('saves a new tab icon in one operation, cleans old icons, and rolls back failed saves', async () => {
    const tab = await tabs.create(a.id, { name: 'Upload tab', iconData: imageData });
    const old = track(tab.icon!);
    const updated = await tabs.update(a.id, tab.id, { iconData: imageData });
    const next = track(updated.icon!);
    expect(old).not.toBe(next);
    expect(existsSync(local(old))).toBe(false);
    expect(existsSync(local(next))).toBe(true);
    const rejected = await uploads.saveTabIconData(imageData);
    track(rejected);
    const writer = jest.spyOn(uploads, 'saveTabIconData').mockResolvedValueOnce(rejected);
    const save = jest.spyOn(db.getRepository(VocabularyTab), 'save').mockRejectedValueOnce(new Error('save failed'));
    try {
      await expect(tabs.update(a.id, tab.id, { iconData: imageData })).rejects.toThrow('save failed');
      expect(existsSync(local(rejected))).toBe(false);
      expect(existsSync(local(next))).toBe(true);
    } finally { writer.mockRestore(); save.mockRestore(); }
    await expect(tabs.update(b.id, tab.id, { iconData: imageData })).rejects.toThrow();
    expect((await tabs.findOne(a.id, tab.id)).icon).toBe(next);
    await tabs.update(a.id, tab.id, { icon: 'book' });
    expect(existsSync(local(next))).toBe(false);
  });
  it('cleans failed vocabulary uploads but preserves files after a committed save', async () => {
    const old = await newImage();
    const first = await addWord(a.id, 'controller-old', old);
    await addWord(a.id, 'controller-duplicate', '');
    const service = { update: (id: string, userId: string, dto: any) => words.update(id, userId, dto) };
    const controller = new VocabularyController(service as any, uploads, {} as any, {} as any);
    const failed = await newImage();
    const spy = jest.spyOn(uploads, 'saveBase64Image').mockResolvedValueOnce(failed);
    try {
      await expect(controller.update(first.id, { word: 'controller-duplicate', meaning: 'controller-duplicate', image: imageData }, {user:{id:a.id}})).rejects.toMatchObject({status:409});
      expect(existsSync(local(failed))).toBe(false);
      expect(existsSync(local(old))).toBe(true);
      const next = await newImage();
      spy.mockResolvedValueOnce(next);
      await controller.update(first.id, { image: imageData }, {user:{id:a.id}});
      expect(existsSync(local(old))).toBe(false);
      expect(existsSync(local(next))).toBe(true);
    } finally { spy.mockRestore(); }
  });
  it('rejects external URLs and path traversal and retains files referenced by absolute URLs', async () => {
    expect(managedUploadPath('/uploads/../database.sqlite')).toBeUndefined();
    expect(managedUploadPath('https://example.invalid/uploads/test.png')).toBeUndefined();
    expect(managedUploadPath('data:image/png;base64,abc')).toBeUndefined();
    const path = await newImage();
    const word = await addWord(b.id, 'absolute-reference', 'https://example.invalid' + path);
    await cleanupUnusedUploads(db.manager, [path]);
    expect(existsSync(local(path))).toBe(true);
    await words.update(word.id, b.id, { image: '' });
    await cleanupUnusedUploads(db.manager, [path]);
    expect(existsSync(local(path))).toBe(false);
  });
});
