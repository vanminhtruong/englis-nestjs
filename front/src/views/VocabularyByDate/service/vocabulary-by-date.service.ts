import apiService from '../../../services/api.service'
import { websocketService } from '../../../services/websocket.service'
import type { VocabularyByDate } from '../interface/vocabulary-by-date.interface'

export class VocabularyByDateService {
  async loadVocabulariesByDate(): Promise<{ success: boolean; data?: VocabularyByDate[]; error?: string }> {
    try {
      const response = await apiService.vocabulary.getByLearningDate()
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error loading vocabularies by date:', error)
      const errorMessage = error.response?.data?.message
        || error.message
        || 'Failed to load vocabularies by date'
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  async moveCategoryByDate(data: { fromDate: string; toDate: string; categoryId: string }): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.vocabulary.moveByLearningDate(data)
      websocketService.emit('vocabulary:bydate:refresh', {})
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to move vocabularies'
      return { success: false, error: message }
    }
  }

  async updateCategoryTopic(data: { date: string; topic: string; icon?: string; color?: string }): Promise<{ success: boolean; error?: string }> {
    try {
      await apiService.vocabulary.updateCategoryTopic(data)
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update topic'
      return { success: false, error: message }
    }
  }

  setupWebSocketListeners(onRefresh: () => void) {
    // Listen for any vocabulary changes to refresh the list
    websocketService.on('vocabulary:created', onRefresh)
    websocketService.on('vocabulary:updated', onRefresh)
    websocketService.on('vocabulary:deleted', onRefresh)
    websocketService.on('vocabulary:bydate:refresh', onRefresh)
  }

  cleanupWebSocketListeners(onRefresh: () => void) {
    websocketService.off('vocabulary:created', onRefresh)
    websocketService.off('vocabulary:updated', onRefresh)
    websocketService.off('vocabulary:deleted', onRefresh)
    websocketService.off('vocabulary:bydate:refresh', onRefresh)
  }
}

export const vocabularyByDateService = new VocabularyByDateService()
