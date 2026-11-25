import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { cleanupUnusedUploads } from './unused-upload';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  constructor(@Optional() @InjectDataSource() private readonly database?: DataSource) {
    // Ensure upload directory exists
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveFile(file: any): Promise<string> {
    if (!file?.buffer || !/^image\/(?:png|jpeg|webp|gif|bmp|x-icon)$/.test(file.mimetype ?? '')) {
      throw new BadRequestException('Invalid image upload');
    }
    return this.saveBase64Image(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
  }

  /** Safe, purpose-built tab icon upload. Never trust the client filename or MIME alone. */
  async saveTabIcon(file?: {
    buffer?: Buffer;
    mimetype?: string;
    size?: number;
  }): Promise<string> {
    const buffer = file?.buffer;
    if (!buffer || !buffer.length || buffer.length > 2 * 1024 * 1024) {
      throw new BadRequestException('Icon must be an image smaller than 2 MB');
    }
    const png =
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg =
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;
    const webp =
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';

    const extension =
      png && file?.mimetype === 'image/png'
        ? 'png'
        : jpeg && file?.mimetype === 'image/jpeg'
          ? 'jpg'
          : webp && file?.mimetype === 'image/webp'
            ? 'webp'
            : null;
    if (!extension) {
      throw new BadRequestException(
        'Only PNG, JPG and WebP icons are supported',
      );
    }

    const directory = join(this.uploadPath, 'tab-icons');
    if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
    const fileName = `${randomUUID()}.${extension}`;
    writeFileSync(join(directory, fileName), buffer, { flag: 'wx' });
    return `/uploads/tab-icons/${fileName}`;
  }

  /**
   * Persist an authenticated user's custom background using a server-generated
   * filename. Only raster images are accepted (SVG/HTML cannot be uploaded).
   */
  async saveUserBackground(file?: {
    buffer?: Buffer;
    mimetype?: string;
    size?: number;
    originalname?: string;
  }): Promise<string> {
    const bytes = file?.buffer;
    const maxBytes = 5 * 1024 * 1024;
    if (!bytes || bytes.length < 12 || bytes.length > maxBytes) {
      throw new BadRequestException(
        'Background image must be between 12 bytes and 5 MB',
      );
    }

    const png =
      bytes.length >= 8 &&
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const webp =
      bytes.toString('ascii', 0, 4) === 'RIFF' &&
      bytes.toString('ascii', 8, 12) === 'WEBP';

    const extension =
      png && file?.mimetype === 'image/png'
        ? 'png'
        : jpeg && file?.mimetype === 'image/jpeg'
          ? 'jpg'
          : webp && file?.mimetype === 'image/webp'
            ? 'webp'
            : null;

    if (!extension) {
      throw new BadRequestException(
        'Only PNG, JPG and WebP backgrounds are supported',
      );
    }

    const directory = join(this.uploadPath, 'user-backgrounds');
    if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
    const name = `${randomUUID()}.${extension}`;
    writeFileSync(join(directory, name), bytes, { flag: 'wx' });
    return `/uploads/user-backgrounds/${name}`;
  }

  async discardIfUnused(...paths: unknown[]): Promise<void> {
    if (this.database) await cleanupUnusedUploads(this.database.manager, paths);
  }

  async saveTabIconData(data: string): Promise<string> {
    const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(data);
    if (!match || match[2].length > Math.ceil(2 * 1024 * 1024 / 3) * 4) {
      throw new BadRequestException('Invalid tab icon image');
    }
    return this.saveTabIcon({ mimetype: match[1], buffer: Buffer.from(match[2], 'base64') });
  }


  async saveBase64Image(base64Data: string): Promise<string> {
    const match = /^data:image\/([a-z0-9.+-]+);base64,([A-Za-z0-9+/]+={0,2})$/i.exec(base64Data);
    if (!match) throw new BadRequestException('Invalid image data');
    const extensions: Record<string, string> = { png: 'png', jpeg: 'jpg', jpg: 'jpg', webp: 'webp', gif: 'gif', bmp: 'bmp', avif: 'avif', tiff: 'tiff', 'x-icon': 'ico', 'vnd.microsoft.icon': 'ico' };
    const extension = extensions[match[1].toLowerCase()];
    if (!extension) throw new BadRequestException('Unsupported image format');
    const buffer = Buffer.from(match[2], 'base64');
    if (!buffer.length) throw new BadRequestException('Empty image data');
    const fileName = `${randomUUID()}.${extension}`;
    const filePath = join(this.uploadPath, fileName);
    writeFileSync(filePath, buffer, { flag: 'wx' });

    return `/uploads/${fileName}`;
  }
}
