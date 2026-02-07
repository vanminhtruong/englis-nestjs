import apiService from '../../../services/api.service'
import { useVocabularyStore } from '../../../stores/vocabulary.store'
import { websocketService } from '../../../services/websocket.service'
import type { Vocabulary } from '../../../stores/vocabulary.store'

export class VocabularyService {
  private store = useVocabularyStore()

  async loadVocabularies(params?: { page?: number; limit?: number; search?: string; difficulty?: 'easy' | 'medium' | 'hard'; tabId?: string }) {
    this.store.setLoading(true)
    try {
      const response = await apiService.vocabulary.getAll({
        page: params?.page ?? this.store.page,
        limit: params?.limit ?? this.store.limit,
        search: params?.search,
        difficulty: params?.difficulty,
        tabId: params?.tabId,
      })
      const { data, meta } = response.data
      this.store.setVocabularies(data)
      if (meta) this.store.setMeta(meta)
    } catch (error) {
      console.error('Failed to load vocabularies:', error)
    } finally {
      this.store.setLoading(false)
    }
  }

  async createVocabulary(data: Partial<Vocabulary> & { categoryIds?: string[] }) {
    try {
      const response = await apiService.vocabulary.create(data)
      this.store.addVocabulary(response.data)
      websocketService.emit('vocabulary:created', response.data)
      // Refresh current page to keep pagination consistent in realtime
      await this.loadVocabularies({ page: this.store.page, limit: this.store.limit })
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create vocabulary',
      }
    }
  }

  async togglePin(id: string) {
    try {
      const response = await apiService.vocabulary.togglePin(id)
      this.store.updateVocabulary(id, response.data)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to toggle pin',
      }
    }
  }

  async updateVocabulary(id: string, data: Partial<Vocabulary> & { categoryIds?: string[] }) {
    try {
      const response = await apiService.vocabulary.update(id, data)
      this.store.updateVocabulary(id, response.data)
      websocketService.emit('vocabulary:updated', response.data)
      // Refresh current page
      await this.loadVocabularies({ page: this.store.page, limit: this.store.limit })
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update vocabulary',
      }
    }
  }

  async deleteVocabulary(id: string) {
    try {
      await apiService.vocabulary.delete(id)
      this.store.removeVocabulary(id)
      websocketService.emit('vocabulary:deleted', { id })
      // Reload current page (could change pageCount)
      await this.loadVocabularies({ page: this.store.page, limit: this.store.limit })
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete vocabulary',
      }
    }
  }

  async toggleFavorite(id: string) {
    try {
      const response = await apiService.vocabulary.toggleFavorite(id)
      this.store.updateVocabulary(id, response.data)
      websocketService.emit('vocabulary:favorited', response.data)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to toggle favorite',
      }
    }
  }

  async loadFavorites() {
    try {
      const response = await apiService.vocabulary.getFavorites()
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load favorites',
      }
    }
  }

  setupWebSocketListeners() {
    websocketService.on('vocabulary:created', (data: Vocabulary) => {
      // Reload to ensure pagination + meta stay consistent across clients
      this.loadVocabularies({ page: this.store.page, limit: this.store.limit })
    })

    websocketService.on('vocabulary:updated', (data: Vocabulary) => {
      this.loadVocabularies({ page: this.store.page, limit: this.store.limit })
    })

    websocketService.on('vocabulary:deleted', (data: { vocabularyId: string }) => {
      this.loadVocabularies({ page: this.store.page, limit: this.store.limit })
    })

    websocketService.on('vocabulary:favorited', (data: Vocabulary) => {
      this.loadVocabularies({ page: this.store.page, limit: this.store.limit })
    })

    websocketService.on('vocabulary:pinned', (data: Vocabulary) => {
      this.loadVocabularies({ page: this.store.page, limit: this.store.limit })
    })
  }

  cleanupWebSocketListeners() {
    websocketService.off('vocabulary:created', () => { })
    websocketService.off('vocabulary:updated', () => { })
    websocketService.off('vocabulary:deleted', () => { })
    websocketService.off('vocabulary:favorited', () => { })
    websocketService.off('vocabulary:pinned', () => { })
  }
}

export const vocabularyService = new VocabularyService()
