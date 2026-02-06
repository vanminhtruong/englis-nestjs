import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../../entities/user.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { PracticeHistory } from '../../entities/practice-history.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { AuthHashService } from './services/auth-hash.service';
import { AuthTokenService } from './services/auth-token.service';
import { UserRepository } from './repositories/user.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vocabulary, PracticeHistory]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-here',
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthHashService,
    AuthTokenService,
    UserRepository,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService, JwtStrategy, UserRepository],
})
export class AuthModule { }
