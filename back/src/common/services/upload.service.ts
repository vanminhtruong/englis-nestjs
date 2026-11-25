import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveFile(file: any): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;
    const filePath = join(this.uploadPath, fileName);

    writeFileSync(filePath, file.buffer);

    return `/uploads/${fileName}`;
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

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = join(process.cwd(), filePath);
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async saveBase64Image(base64Data: string): Promise<string> {
    // Remove data:image/...;base64, prefix if present
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');

    const fileName = `${randomUUID()}.png`;
    const filePath = join(this.uploadPath, fileName);

    writeFileSync(filePath, buffer);

    return `/uploads/${fileName}`;
  }
}
