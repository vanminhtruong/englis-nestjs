import apiService from '../../../services/api.service'
import { websocketService } from '../../../services/websocket.service'
import type { History, HistoryStatistics } from '../interface'

export class HistoryService {
  private historyCreatedCallback: ((data: History) => void) | null = null
  private historyDeletedCallback: ((data: { historyId: string }) => void) | null = null

  async loadHistory(params?: { page?: number; limit?: number }): Promise<{ success: boolean; data?: History[]; meta?: { page: number; limit: number; total: number; pageCount: number }; error?: string }> {
    try {
      const response = await apiService.history.getAll({
        page: params?.page,
        limit: params?.limit,
      })
      const { data, meta } = response.data
      return { success: true, data, meta }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load history',
      }
    }
  }

  async loadStatistics(): Promise<{ success: boolean; data?: HistoryStatistics; error?: string }> {
    try {
      const response = await apiService.history.getStatistics()
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load statistics',
      }
    }
  }

  async deleteHistory(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.history.delete(id)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete history',
      }
    }
  }

  async deleteMany(ids: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.history.deleteMany(ids)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete histories',
      }
    }
  }

  async deleteAll(): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.history.deleteAll()
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete all histories',
      }
    }
  }

  setupWebSocketListeners(onNewHistory: (history: History) => void, onHistoryDeleted: (historyId: string) => void) {
    // Cleanup old listeners nếu có
    this.cleanupWebSocketListeners()

    // Tạo và lưu callbacks mới
    this.historyCreatedCallback = (data: History) => {
      onNewHistory(data)
    }

    this.historyDeletedCallback = (data: { historyId: string }) => {
      onHistoryDeleted(data.historyId)
    }

    // Register listeners
    websocketService.on('history:created', this.historyCreatedCallback)
    websocketService.on('history:deleted', this.historyDeletedCallback)
  }

  cleanupWebSocketListeners() {
    if (this.historyCreatedCallback) {
      websocketService.off('history:created', this.historyCreatedCallback)
      this.historyCreatedCallback = null
    }

    if (this.historyDeletedCallback) {
      websocketService.off('history:deleted', this.historyDeletedCallback)
      this.historyDeletedCallback = null
    }
  }
}

export const historyService = new HistoryService()
