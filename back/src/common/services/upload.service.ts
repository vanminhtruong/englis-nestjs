import { Injectable } from '@nestjs/common';
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

    const timestamp = Date.now();
    const fileName = `${timestamp}.png`;
    const filePath = join(this.uploadPath, fileName);

    writeFileSync(filePath, buffer);

    return `/uploads/${fileName}`;
  }
}
