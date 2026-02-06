import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { HelloModule } from './modules/hello/hello.module';
import { AuthModule } from './modules/auth/auth.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { PracticeModule } from './modules/practice/practice.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { CategoryModule } from './modules/category/category.module';
import { HistoryModule } from './modules/history/history.module';
import { TagModule } from './modules/tag/tag.module';
import { VoiceModule } from './modules/voice/voice.module';
import { LearningProgressModule } from './modules/learning-progress/learning-progress.module';
import { BackgroundModule } from './modules/background/background.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    HelloModule,
    AuthModule,
    VocabularyModule,
    PracticeModule,
    WebsocketModule,
    CategoryModule,
    HistoryModule,
    TagModule,
    VoiceModule,
    LearningProgressModule,
    BackgroundModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
