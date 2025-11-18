import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
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
  ) {}

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
}
