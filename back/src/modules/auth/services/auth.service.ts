import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
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
import {
  buildUserDataSnapshot,
  mergeChangeCount,
  mergeUserDataSnapshot,
} from '../../../common/user-data/user-data-snapshot';
import {
  snapshotToXlsxBuffer,
  xlsxBufferToSnapshot,
} from '../../../common/user-data/user-data-xlsx';

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

  async validateGoogleUser(googleUser: { email: string; fullName: string; avatar: string; accessToken: string }) {
    let user = await this.userRepository.findByEmail(googleUser.email);

    if (!user) {
      // Create new user if not exists
      user = await this.userRepository.create({
        email: googleUser.email,
        fullName: googleUser.fullName,
        avatar: googleUser.avatar,
        password: '', // No password for Google users
      });
    }

    return user;
  }


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

    // Accounts created with Google have no password, so no password can match.
    // Say so instead of the generic error, which looks like a wrong password.
    if (!user.password) {
      throw new UnauthorizedException(
        'This account has no password (it was created with Google). Sign in with Google, or use "Forgot password" to set one.',
      );
    }

    const isPasswordValid = await this.hashService.comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.tokenService.generateToken(user.id, user.email, loginDto.rememberMe);

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

  /**
   * One Excel file with everything the account holds: words, practice history,
   * categories, tags, "by learning date" topics, tabs and Smart review.
   */
  async exportUserData(userId: string): Promise<Buffer> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { snapshot } = await buildUserDataSnapshot(
      this.vocabularyRepository.manager,
      userId,
    );
    return snapshotToXlsxBuffer(snapshot);
  }

  async importUserData(userId: string, file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('NO_FILE');
    }

    let snapshot;
    try {
      snapshot = await xlsxBufferToSnapshot(file.buffer);
    } catch {
      throw new BadRequestException('INVALID_FILE');
    }

    // All or nothing: a file that fails halfway must not leave half its data behind.
    const stats = await this.vocabularyRepository.manager.transaction((manager) =>
      mergeUserDataSnapshot(manager, userId, snapshot, 'import'),
    );
    await this.userRepository.recalculateTotalWords(userId);

    if (mergeChangeCount(stats) === 0) {
      return {
        success: true,
        noChanges: true,
        message: 'DATA_ALREADY_EXISTS',
        stats,
      };
    }

    return {
      success: true,
      noChanges: false,
      message: 'IMPORT_SUCCESS',
      stats,
    };
  }
}
