import { Injectable } from '@nestjs/common';
import { HistoryRepository } from '../repositories/history.repository';
import { CreateHistoryDto } from '../dto/create-history.dto';
import { VocabularyWebSocketGateway } from '../../websocket/websocket.gateway';

@Injectable()
export class HistoryService {
  constructor(
    private readonly historyRepository: HistoryRepository,
    private readonly websocketGateway: VocabularyWebSocketGateway,
  ) {}

  async create(createHistoryDto: CreateHistoryDto) {
    const history = await this.historyRepository.create(createHistoryDto);

    // Emit real-time event
    this.websocketGateway.emitHistoryCreated(history);

    return history;
  }

  async findByUser(userId: string) {
    return this.historyRepository.findByUser(userId);
  }

  async findByUserPaginated(userId: string, page: number, limit: number) {
    return this.historyRepository.findByUserPaginated(userId, page, limit);
  }

  async getStatistics(userId: string) {
    return this.historyRepository.getStatistics(userId);
  }

  async delete(id: string, userId: string) {
    await this.historyRepository.deleteById(id, userId);
    
    // Emit real-time event
    this.websocketGateway.emitHistoryDeleted(id, userId);
  }
}
