import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VocabularyWebSocketGateway } from './websocket.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-here',
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => AuthModule),
  ],
  providers: [VocabularyWebSocketGateway],
  exports: [VocabularyWebSocketGateway],
})
export class WebsocketModule {}
