import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { VoiceCrudService } from '../modules/voice/services/voice-crud.service';

async function seedVoices() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const voiceCrudService = app.get(VoiceCrudService);

  const voices = [
    {
      key: 'en-us-standard-female-1',
      name: 'English (US) Female 1',
      languageCode: 'en-US',
      gender: 'female' as const,
      provider: 'browser',
      isDefault: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      key: 'en-us-standard-male-1',
      name: 'English (US) Male 1',
      languageCode: 'en-US',
      gender: 'male' as const,
      provider: 'browser',
      isDefault: false,
      isActive: true,
      sortOrder: 2,
    },
    {
      key: 'vi-vn-standard-female-1',
      name: 'Tiếng Việt Nữ 1',
      languageCode: 'vi-VN',
      gender: 'female' as const,
      provider: 'browser',
      isDefault: false,
      isActive: true,
      sortOrder: 3,
    },
    {
      key: 'vi-vn-standard-male-1',
      name: 'Tiếng Việt Nam 1',
      languageCode: 'vi-VN',
      gender: 'male' as const,
      provider: 'browser',
      isDefault: false,
      isActive: true,
      sortOrder: 4,
    },
    {
      key: 'ko-kr-standard-female-1',
      name: '한국어 여성 1',
      languageCode: 'ko-KR',
      gender: 'female' as const,
      provider: 'browser',
      isDefault: false,
      isActive: true,
      sortOrder: 5,
    },
    {
      key: 'ko-kr-standard-male-1',
      name: '한국어 남성 1',
      languageCode: 'ko-KR',
      gender: 'male' as const,
      provider: 'browser',
      isDefault: false,
      isActive: true,
      sortOrder: 6,
    },
  ];

  try {
    await voiceCrudService.upsertMany(voices);
    const all = await voiceCrudService.getAllActive();
    console.log('Seeded voices:', all.length);
  } catch (error) {
    console.error('Error seeding voices:', error);
  }

  await app.close();
}

seedVoices();


