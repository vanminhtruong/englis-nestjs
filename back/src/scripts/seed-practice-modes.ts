import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PracticeModeService } from '../modules/practice/services/practice-mode.service';

async function seedPracticeModes() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const practiceModeService = app.get(PracticeModeService);

  const modes = [
    {
      key: 'flashcard',
      name: 'Flashcard',
      description: 'What is the meaning of this word?',
      icon: '🎴',
      color: 'from-primary-500 to-secondary-500',
      isActive: true,
      sortOrder: 1,
    },
    {
      key: 'typing',
      name: 'Typing',
      description: 'Type the corresponding word',
      icon: '⌨️',
      color: 'from-purple-500 to-pink-500',
      isActive: true,
      sortOrder: 2,
    },
    {
      key: 'image_guess',
      name: 'Image Guess',
      description: 'Guess the meaning from the image',
      icon: '🖼️',
      color: 'from-pink-500 to-rose-500',
      isActive: true,
      sortOrder: 3,
    },
    {
      key: 'practice_by_date',
      name: 'Practice by Date',
      description: 'Select a specific date to practice',
      icon: '📅',
      color: 'from-orange-500 to-red-500',
      isActive: true,
      sortOrder: 4,
    },
    {
      key: 'multiple_choice',
      name: 'Multiple Choice',
      description: 'Select the correct answer',
      icon: '📝',
      color: 'from-blue-500 to-cyan-500',
      isActive: false,
      sortOrder: 4,
    },
    {
      key: 'listening',
      name: 'Listening',
      description: 'Listen and identify the word',
      icon: '🎧',
      color: 'from-green-500 to-emerald-500',
      isActive: false,
      sortOrder: 5,
    },
  ];

  try {
    for (const mode of modes) {
      const existingMode = await practiceModeService.getModeByKey(mode.key);
      if (!existingMode) {
        await practiceModeService.createMode(mode);
        console.log(`Created practice mode: ${mode.name}`);
      } else {
        console.log(`Practice mode already exists: ${mode.name}`);
      }
    }

    const allModes = await practiceModeService.getAllActiveModes();
    console.log('All practice modes:', allModes);
  } catch (error) {
    console.error('Error seeding practice modes:', error);
  }

  await app.close();
}

seedPracticeModes();
