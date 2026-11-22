import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserBackground } from '../../entities/user-background.entity';
import { UploadService } from '../../common/services/upload.service';
import { UserBackgroundService } from './services/user-background.service';
import * as remoteBackground from './services/remote-background-download';

describe('Personal background library (SQLite)', () => {
  let database: DataSource;
  let service: UserBackgroundService;
  let uploads: UploadService;
  let userA: string;
  let userB: string;
  const createdFiles: string[] = [];

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLTTAAAAABJRU5ErkJggg==',
    'base64',
  );

  beforeAll(async () => {
    database = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [join(__dirname, '../../entities/*.entity.ts')],
      synchronize: true,
      logging: false,
    });
    await database.initialize();
    uploads = new UploadService();
    service = new UserBackgroundService(
      database.getRepository(UserBackground),
      uploads,
    );
    const users = database.getRepository(User);
    userA = (await users.save(users.create({ fullName: 'Owner A' }))).id;
    userB = (await users.save(users.create({ fullName: 'Owner B' }))).id;
  });

  afterAll(async () => {
    for (const path of createdFiles) if (existsSync(path)) unlinkSync(path);
    if (database?.isInitialized) await database.destroy();
  });

  it('persists a valid raster upload and returns it only for its owner', async () => {
    const uploaded = await service.upload(userA, {
      buffer: png,
      size: png.length,
      mimetype: 'image/png',
      originalname: '../Summer in New York.png',
    });
    expect(uploaded.url).toMatch(
      /^\/uploads\/user-backgrounds\/[a-f0-9-]{36}\.png$/,
    );
    expect(uploaded.name).toBe('Summer in New York');
    const filePath = join(process.cwd(), uploaded.url.slice(1));
    createdFiles.push(filePath);
    expect(existsSync(filePath)).toBe(true);

    const mine = await service.findMine(userA);
    expect(mine.map((item) => item.id)).toContain(uploaded.id);
    expect(await service.findMine(userB)).toEqual([]);
  });

  it('rejects disallowed formats, MIME mismatches, empty and oversized files', async () => {
    await expect(
      service.upload(userA, {
        buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
        size: 45,
        mimetype: 'image/svg+xml',
      }),
    ).rejects.toThrow();
    await expect(
      service.upload(userA, {
        buffer: png,
        mimetype: 'image/jpeg',
        size: png.length,
      }),
    ).rejects.toThrow();
    await expect(
      service.upload(userA, {
        buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
        mimetype: 'image/png',
      }),
    ).rejects.toThrow();
    await expect(service.upload(userA)).rejects.toThrow();
    expect((await service.findMine(userA)).length).toBe(1);
  });

  it('does not trust the original filename for the disk location', async () => {
    const image = await service.upload(userB, {
      buffer: png,
      size: png.length,
      mimetype: 'image/png',
      originalname: '../../evil.html.png',
    });
    createdFiles.push(join(process.cwd(), image.url.slice(1)));
    expect(image.url).not.toContain('evil');
    expect(image.url).not.toContain('..');
    expect((await service.findMine(userB)).length).toBe(1);
    expect((await service.findMine(userA)).length).toBe(1);
  });

  it('imports a verified remote image into the same private library', async () => {
    const download = jest
      .spyOn(remoteBackground, 'downloadRemoteBackground')
      .mockResolvedValueOnce({
        buffer: png,
        mimetype: 'image/png',
        originalname: 'remote-background.png',
      });
    try {
      const result = await service.importFromUrl(
        userB,
        'https://images.example.org/background.png',
      );
      createdFiles.push(join(process.cwd(), result.url.slice(1)));
      expect(download).toHaveBeenCalledWith(
        'https://images.example.org/background.png',
      );
      expect(result.name).toBe('remote-background');
      expect(result.url).toMatch(
        /^\/uploads\/user-backgrounds\/[a-f0-9-]{36}\.png$/,
      );
      expect((await service.findMine(userB)).map((item) => item.id)).toContain(
        result.id,
      );
      expect(
        (await service.findMine(userA)).map((item) => item.id),
      ).not.toContain(result.id);
    } finally {
      download.mockRestore();
    }
  });
});
