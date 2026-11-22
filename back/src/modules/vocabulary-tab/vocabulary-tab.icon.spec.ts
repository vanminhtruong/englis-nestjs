import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { validateSync } from 'class-validator';
import { DataSource } from 'typeorm';
import { UploadService } from '../../common/services/upload.service';
import { User } from '../../entities/user.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import { CreateVocabularyTabDto } from './dto/create-vocabulary-tab.dto';
import { UpdateVocabularyTabDto } from './dto/update-vocabulary-tab.dto';
import { VocabularyTabService } from './vocabulary-tab.service';

describe('Vocabulary tab icons', () => {
  let database: DataSource;
  let service: VocabularyTabService;
  let userId: string;
  let otherUserId: string;

  beforeAll(async () => {
    database = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [join(__dirname, '../../entities/*.entity.ts')],
      synchronize: true,
      logging: false,
    });
    await database.initialize();
    service = new VocabularyTabService(
      database.getRepository(VocabularyTab),
      database.getRepository(Vocabulary),
    );
    const users = database.getRepository(User);
    userId = (await users.save(users.create({ fullName: 'Tab icon owner' })))
      .id;
    otherUserId = (await users.save(users.create({ fullName: 'Other owner' })))
      .id;
  });

  afterAll(async () => {
    if (database?.isInitialized) await database.destroy();
  });

  it('persists a preset icon, keeps it on rename and allows replacement/removal', async () => {
    const tab = await service.create(userId, {
      name: 'Languages',
      icon: 'graduation-cap',
    });
    expect(tab.icon).toBe('graduation-cap');
    expect((await service.findAll(userId))[0]?.icon).toBe('graduation-cap');

    await service.update(userId, tab.id, { name: 'Languages 2' });
    expect((await service.findOne(userId, tab.id)).icon).toBe('graduation-cap');

    const path = '/uploads/tab-icons/123e4567-e89b-12d3-a456-426614174000.webp';
    await service.update(userId, tab.id, { icon: path });
    expect((await service.findOne(userId, tab.id)).icon).toBe(path);

    await service.update(userId, tab.id, { icon: null });
    expect((await service.findOne(userId, tab.id)).icon).toBeNull();

    await expect(
      service.update(otherUserId, tab.id, { icon: 'heart' }),
    ).rejects.toThrow();
    expect((await service.findOne(userId, tab.id)).icon).toBeNull();
  });

  it('validates allowed preset names and server-generated upload paths', () => {
    const valid = Object.assign(new CreateVocabularyTabDto(), {
      name: 'Valid tab',
      icon: 'book',
    });
    expect(validateSync(valid)).toHaveLength(0);

    for (const icon of [
      '/uploads/../../other.png',
      'https://example.com/icon.svg',
      'data:image/svg+xml;base64,',
      '<svg>',
    ]) {
      const invalid = Object.assign(new UpdateVocabularyTabDto(), { icon });
      expect(validateSync(invalid)).not.toHaveLength(0);
    }
    expect(
      validateSync(Object.assign(new UpdateVocabularyTabDto(), { icon: null })),
    ).toHaveLength(0);
  });

  it('uploads a limited PNG and rejects SVG, oversized or mismatched files', async () => {
    const uploads = new UploadService();
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLTTAAAAABJRU5ErkJggg==',
      'base64',
    );
    const iconPath = await uploads.saveTabIcon({
      buffer: png,
      size: png.length,
      mimetype: 'image/png',
    });
    expect(iconPath).toMatch(/^\/uploads\/tab-icons\/[a-f0-9-]{36}\.png$/);
    const localPath = join(process.cwd(), iconPath.slice(1));
    try {
      expect(existsSync(localPath)).toBe(true);
    } finally {
      if (existsSync(localPath)) rmSync(localPath);
    }

    await expect(
      uploads.saveTabIcon({
        buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
        mimetype: 'image/svg+xml',
      }),
    ).rejects.toThrow();

    await expect(
      uploads.saveTabIcon({
        buffer: png,
        mimetype: 'image/jpeg',
      }),
    ).rejects.toThrow();

    await expect(
      uploads.saveTabIcon({
        buffer: Buffer.alloc(2 * 1024 * 1024 + 1),
        mimetype: 'image/png',
      }),
    ).rejects.toThrow();
  });
});
