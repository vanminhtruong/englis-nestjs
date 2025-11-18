import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VocabularyWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      this.connectedUsers.set(client.id, payload.sub);

      console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
      
      // Broadcast to all clients that a user connected
      this.server.emit('user:connected', {
        userId: payload.sub,
        timestamp: new Date(),
      });
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    
    console.log(`Client disconnected: ${client.id}`);
    
    if (userId) {
      this.server.emit('user:disconnected', {
        userId,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('vocabulary:created')
  handleVocabularyCreated(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    this.server.emit('vocabulary:created', {
      ...data,
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('vocabulary:updated')
  handleVocabularyUpdated(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    this.server.emit('vocabulary:updated', {
      ...data,
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('vocabulary:deleted')
  handleVocabularyDeleted(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    this.server.emit('vocabulary:deleted', {
      ...data,
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('practice:completed')
  handlePracticeCompleted(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    this.server.emit('practice:completed', {
      ...data,
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('user:typing')
  handleUserTyping(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    client.broadcast.emit('user:typing', {
      userId,
      ...data,
      timestamp: new Date(),
    });
  }

  // Method to emit events from services
  emitVocabularyCreated(vocabulary: any) {
    this.server.emit('vocabulary:created', {
      ...vocabulary,
      timestamp: new Date(),
    });
  }

  emitVocabularyUpdated(vocabulary: any) {
    this.server.emit('vocabulary:updated', {
      ...vocabulary,
      timestamp: new Date(),
    });
  }

  emitVocabularyDeleted(vocabularyId: string) {
    this.server.emit('vocabulary:deleted', {
      vocabularyId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('vocabulary:bydate:refresh')
  handleVocabularyByDateRefresh(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedUsers.get(client.id);
    this.server.emit('vocabulary:bydate:refresh', {
      ...data,
      userId,
      timestamp: new Date(),
    });
  }

  emitVocabularyByDateRefresh(userId: string) {
    this.server.emit('vocabulary:bydate:refresh', {
      userId,
      timestamp: new Date(),
    });
  }

  emitThemeChanged(userId: string, theme: string) {
    this.server.emit('user:theme:changed', {
      userId,
      theme,
      timestamp: new Date(),
    });
  }

  emitLayoutChanged(userId: string, layout: 'grid' | 'list') {
    this.server.emit('user:layout:changed', {
      userId,
      layout,
      timestamp: new Date(),
    });
  }

  emitPracticeSubmitted(practiceHistory: any) {
    this.server.emit('practice:submitted', {
      ...practiceHistory,
      timestamp: new Date(),
    });
  }

  emitHistoryCreated(history: any) {
    this.server.emit('history:created', {
      ...history,
      timestamp: new Date(),
    });
  }

  emitHistoryDeleted(historyId: string, userId: string) {
    this.server.emit('history:deleted', {
      historyId,
      userId,
      timestamp: new Date(),
    });
  }

  emitProfileUpdated(userId: string, profile: any) {
    this.server.emit('user:profile:updated', {
      userId,
      profile,
      timestamp: new Date(),
    });
  }
}
