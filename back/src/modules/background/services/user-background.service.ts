import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBackground } from '../../../entities/user-background.entity';
import { cleanupUnusedUploads } from '../../../common/services/unused-upload';
import { UploadService } from '../../../common/services/upload.service';
import { downloadRemoteBackground } from './remote-background-download';

interface BackgroundUpload {
  buffer?: Buffer;
  size?: number;
  mimetype?: string;
  originalname?: string;
}

@Injectable()
export class UserBackgroundService {
  constructor(
    @InjectRepository(UserBackground)
    private readonly repository: Repository<UserBackground>,
    private readonly uploadService: UploadService,
  ) {}

  findMine(userId: string): Promise<UserBackground[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async importFromUrl(userId: string, url: string): Promise<UserBackground> {
    const image = await downloadRemoteBackground(url);
    return this.upload(userId, image);
  }

  async upload(
    userId: string,
    file?: BackgroundUpload,
  ): Promise<UserBackground> {
    // Image content is validated before it can be written to disk.
    const url = await this.uploadService.saveUserBackground(file);
    const rawName = (file?.originalname || 'Custom background')
      .replace(/^.*[\\/]/, '')
      .replace(/\.[^.]+$/, '')
      .replace(/[\x00-\x1f\x7f]/g, '')
      .trim();
    const name = rawName.slice(0, 100) || 'Custom background';
    try {
      return await this.repository.save(this.repository.create({ userId, name, url }));
    } catch (error) {
      await cleanupUnusedUploads(this.repository.manager, [url]);
      throw error;
    }
  }
}
