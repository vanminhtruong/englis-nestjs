import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { UserRepository } from '../repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from '../../../entities/vocabulary.entity';
import { PracticeHistory } from '../../../entities/practice-history.entity';
import { AuthHashService } from './auth-hash.service';
import { AuthTokenService } from './auth-token.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: AuthHashService,
    private readonly tokenService: AuthTokenService,
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(PracticeHistory)
    private readonly practiceHistoryRepository: Repository<PracticeHistory>,
  ) { }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashService.hashPassword(
      registerDto.password,
    );

    const user = await this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      fullName: registerDto.fullName,
    });

    const token = this.tokenService.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        totalScore: user.totalScore,
        totalWords: user.totalWords,
        theme: user.theme || 'light',
        vocabularyLayout: user.vocabularyLayout || 'grid',
      },
      token,
    };
  }

  async updateProfile(
    userId: string,
    payload: UpdateProfileDto,
  ) {
    const updatedUser = await this.userRepository.update(userId, {
      fullName: payload.fullName,
      avatar: payload.avatar,
      theme: payload.theme,
    });

    if (!updatedUser) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      avatar: updatedUser.avatar,
      totalScore: updatedUser.totalScore,
      totalWords: updatedUser.totalWords,
      theme: updatedUser.theme || 'light',
      vocabularyLayout: updatedUser.vocabularyLayout || 'grid',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashService.comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.tokenService.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        totalScore: user.totalScore,
        totalWords: user.totalWords,
        theme: user.theme || 'light',
        vocabularyLayout: user.vocabularyLayout || 'grid',
      },
      token,
    };
  }

  async validateUser(userId: string) {
    return this.userRepository.findById(userId);
  }

  async updateTheme(userId: string, theme: string) {
    return this.userRepository.update(userId, { theme });
  }

  async updateVocabularyLayout(userId: string, layout: 'grid' | 'list') {
    return this.userRepository.update(userId, { vocabularyLayout: layout });
  }

  async recalculateTotalWords(userId: string) {
    await this.userRepository.recalculateTotalWords(userId);
    const updatedUser = await this.userRepository.findById(userId);

    if (!updatedUser) {
      throw new Error('User not found after recalculation');
    }

    return {
      id: updatedUser.id,
      totalWords: updatedUser.totalWords,
    };
  }

  async exportUserData(userId: string): Promise<Buffer> {
    const user = await this.userRepository.findByIdWithRelations(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'English Learning App';
    workbook.created = new Date();

    // Sheet 1: Vocabularies
    const vocabSheet = workbook.addWorksheet('Vocabularies');
    vocabSheet.columns = [
      { header: 'Word', key: 'word', width: 20 },
      { header: 'Meaning', key: 'meaning', width: 30 },
      { header: 'Pronunciation', key: 'pronunciation', width: 20 },
      { header: 'Example', key: 'example', width: 40 },
      { header: 'Example Translation', key: 'exampleTranslation', width: 40 },
      { header: 'Note', key: 'note', width: 30 },
      { header: 'Image', key: 'image', width: 50 },
      { header: 'Video', key: 'video', width: 50 },
      { header: 'Audio', key: 'audio', width: 50 },
      { header: 'Difficulty', key: 'difficulty', width: 15 },
      { header: 'Mastery Level', key: 'masteryLevel', width: 15 },
      { header: 'Correct Count', key: 'correctCount', width: 15 },
      { header: 'Incorrect Count', key: 'incorrectCount', width: 15 },
      { header: 'Tags', key: 'tags', width: 30 },
      { header: 'Is Favorite', key: 'isFavorite', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];
    if (user.vocabularies) {
      user.vocabularies.forEach((v) => {
        vocabSheet.addRow({
          word: v.word,
          meaning: v.meaning,
          pronunciation: v.pronunciation,
          example: v.example,
          exampleTranslation: v.exampleTranslation || '',
          note: v.note || '',
          image: v.image || '',
          video: v.video || '',
          audio: v.audio || '',
          difficulty: v.difficulty,
          masteryLevel: v.masteryLevel,
          correctCount: v.correctCount,
          incorrectCount: v.incorrectCount,
          tags: v.tags ? v.tags.join(',') : '',
          isFavorite: v.isFavorite ? 'Yes' : 'No',
          createdAt: v.createdAt,
        });
      });
    }

    // Sheet 2: Practice History
    const historySheet = workbook.addWorksheet('Practice History');
    historySheet.columns = [
      { header: 'Word', key: 'word', width: 20 },
      { header: 'Type', key: 'practiceType', width: 20 },
      { header: 'Is Correct', key: 'isCorrect', width: 15 },
      { header: 'User Answer', key: 'userAnswer', width: 30 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Time Spent (s)', key: 'timeSpent', width: 15 },
      { header: 'Date', key: 'createdAt', width: 20 },
    ];
    if (user.practiceHistories) {
      user.practiceHistories.forEach((h) => {
        historySheet.addRow({
          word: h.vocabulary ? h.vocabulary.word : 'N/A',
          practiceType: h.practiceType,
          isCorrect: h.isCorrect ? 'Yes' : 'No',
          userAnswer: h.userAnswer,
          score: h.score,
          timeSpent: h.timeSpent,
          createdAt: h.createdAt,
        });
      });
    }

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  async importUserData(userId: string, file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);

    let newVocabCount = 0;
    let updatedVocabCount = 0;
    let skippedVocabCount = 0;
    let newHistoryCount = 0;

    // Sheet 1: Vocabularies
    const vocabSheet = workbook.getWorksheet('Vocabularies');
    if (vocabSheet) {
      const vocabRows: any[] = [];
      vocabSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const word = row.getCell(1).value?.toString();
          if (word) {
            const tagsValue = row.getCell(14).value?.toString() || '';
            vocabRows.push({
              userId,
              word: word,
              meaning: row.getCell(2).value?.toString() || '',
              pronunciation: row.getCell(3).value?.toString() || '',
              example: row.getCell(4).value?.toString() || '',
              exampleTranslation: row.getCell(5).value?.toString() || '',
              note: row.getCell(6).value?.toString() || '',
              image: row.getCell(7).value?.toString() || null,
              video: row.getCell(8).value?.toString() || null,
              audio: row.getCell(9).value?.toString() || null,
              difficulty: row.getCell(10).value?.toString() || 'easy',
              masteryLevel: row.getCell(11).value?.toString() || 'new',
              correctCount: parseInt(row.getCell(12).value?.toString() || '0'),
              incorrectCount: parseInt(row.getCell(13).value?.toString() || '0'),
              tags: tagsValue ? tagsValue.split(',').map(t => t.trim()) : null,
              isFavorite: row.getCell(15).value?.toString() === 'Yes',
              createdAt: row.getCell(16).value ? new Date(row.getCell(16).value as string) : new Date(),
            });
          }
        }
      });

      for (const vocab of vocabRows) {
        const existing = await this.vocabularyRepository.findOne({
          where: { userId, word: vocab.word },
        });
        if (existing) {
          // Normalize values for comparison (treat empty string as null)
          const normalize = (val: any) => (val === '' || val === undefined ? null : val);
          const normalizeArray = (val: any) => {
            if (!val || (Array.isArray(val) && val.length === 0)) return null;
            return val;
          };

          // Check if data has changed
          const hasChanges =
            normalize(existing.meaning) !== normalize(vocab.meaning) ||
            normalize(existing.pronunciation) !== normalize(vocab.pronunciation) ||
            normalize(existing.example) !== normalize(vocab.example) ||
            normalize(existing.exampleTranslation) !== normalize(vocab.exampleTranslation) ||
            normalize(existing.note) !== normalize(vocab.note) ||
            normalize(existing.image) !== normalize(vocab.image) ||
            normalize(existing.video) !== normalize(vocab.video) ||
            normalize(existing.audio) !== normalize(vocab.audio) ||
            existing.difficulty !== vocab.difficulty ||
            existing.masteryLevel !== vocab.masteryLevel ||
            existing.correctCount !== vocab.correctCount ||
            existing.incorrectCount !== vocab.incorrectCount ||
            JSON.stringify(normalizeArray(existing.tags)) !== JSON.stringify(normalizeArray(vocab.tags)) ||
            existing.isFavorite !== vocab.isFavorite;

          if (hasChanges) {
            await this.vocabularyRepository.update(existing.id, vocab);
            updatedVocabCount++;
          } else {
            skippedVocabCount++;
          }
        } else {
          await this.vocabularyRepository.save(vocab);
          newVocabCount++;
        }
      }

      // Recalculate total words
      await this.userRepository.recalculateTotalWords(userId);
    }

    // Sheet 2: Practice History
    const historySheet = workbook.getWorksheet('Practice History');
    if (historySheet) {
      const historyRows: any[] = [];
      historySheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const word = row.getCell(1).value?.toString();
          if (word) {
            historyRows.push({
              userId,
              word,
              practiceType: row.getCell(2).value?.toString() || 'flashcard',
              isCorrect: row.getCell(3).value?.toString() === 'Yes',
              userAnswer: row.getCell(4).value?.toString() || '',
              score: parseInt(row.getCell(5).value?.toString() || '0'),
              timeSpent: parseInt(row.getCell(6).value?.toString() || '0'),
              createdAt: row.getCell(7).value ? new Date(row.getCell(7).value as string) : new Date(),
            });
          }
        }
      });

      for (const history of historyRows) {
        const vocabulary = await this.vocabularyRepository.findOne({
          where: { userId, word: history.word },
        });

        if (vocabulary) {
          // Check if this exact history already exists
          const existingHistory = await this.practiceHistoryRepository.findOne({
            where: {
              userId,
              vocabularyId: vocabulary.id,
              practiceType: history.practiceType,
              score: history.score,
              timeSpent: history.timeSpent,
            },
          });

          if (!existingHistory) {
            await this.practiceHistoryRepository.save({
              userId,
              vocabularyId: vocabulary.id,
              practiceType: history.practiceType,
              isCorrect: history.isCorrect,
              userAnswer: history.userAnswer,
              score: history.score,
              timeSpent: history.timeSpent,
              createdAt: history.createdAt,
            });
            newHistoryCount++;
          }
        }
      }
    }

    const totalChanges = newVocabCount + updatedVocabCount + newHistoryCount;

    if (totalChanges === 0) {
      return {
        success: true,
        noChanges: true,
        message: 'DATA_ALREADY_EXISTS',
        stats: {
          newVocabularies: 0,
          updatedVocabularies: 0,
          skippedVocabularies: skippedVocabCount,
          newHistories: 0,
        },
      };
    }

    return {
      success: true,
      noChanges: false,
      message: 'IMPORT_SUCCESS',
      stats: {
        newVocabularies: newVocabCount,
        updatedVocabularies: updatedVocabCount,
        skippedVocabularies: skippedVocabCount,
        newHistories: newHistoryCount,
      },
    };
  }
}
