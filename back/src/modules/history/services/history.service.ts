import { Injectable } from '@nestjs/common';
import { HistoryRepository } from '../repositories/history.repository';
import { CreateHistoryDto } from '../dto/create-history.dto';
import { VocabularyWebSocketGateway } from '../../websocket/websocket.gateway';

@Injectable()
export class HistoryService {
  constructor(
    private readonly historyRepository: HistoryRepository,
    private readonly websocketGateway: VocabularyWebSocketGateway,
  ) { }

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

  async deleteMany(ids: string[], userId: string) {
    // Delete each history individually and emit events
    for (const id of ids) {
      await this.historyRepository.deleteById(id, userId);
      this.websocketGateway.emitHistoryDeleted(id, userId);
    }
  }

  async deleteAll(userId: string) {
    const histories = await this.historyRepository.findByUser(userId);

    // Delete all histories and emit events
    for (const history of histories) {
      await this.historyRepository.deleteById(history.id, userId);
      this.websocketGateway.emitHistoryDeleted(history.id, userId);
    }

    return histories.length;
  }
}
