import apiService from '../../../services/api.service'
import { useVocabularyStore } from '../../../stores/vocabulary.store'
import { websocketService } from '../../../services/websocket.service'
import type { Vocabulary } from '../../../stores/vocabulary.store'

export class VocabularyService {
  private store = useVocabularyStore()
  private lastParams: {
    search?: string;
    partOfSpeech?: import('../utils/partOfSpeech').PartOfSpeech | 'all';
    difficulty?: 'easy' | 'medium' | 'hard' | 'all';
    tabId?: string | null;
    categoryIds?: string[];
    tags?: string[];
  } = {}

  async loadVocabularies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    partOfSpeech?: import('../utils/partOfSpeech').PartOfSpeech | 'all';
    difficulty?: 'easy' | 'medium' | 'hard' | 'all';
    tabId?: string | null;
    categoryIds?: string[];
    tags?: string[];
  }) {
    this.store.setLoading(true)

    // Update last used filters if explicit values (even null/empty) are provided
    if (params) {
      if (params.partOfSpeech !== undefined) this.lastParams.partOfSpeech = params.partOfSpeech;
      if (params.search !== undefined) this.lastParams.search = params.search;
      if (params.difficulty !== undefined) this.lastParams.difficulty = params.difficulty;
      if (params.tabId !== undefined) this.lastParams.tabId = params.tabId;
      if (params.categoryIds !== undefined) this.lastParams.categoryIds = params.categoryIds;
      if (params.tags !== undefined) this.lastParams.tags = params.tags;
    }

    try {
      const difficulty = (this.lastParams.difficulty === 'all' ? undefined : this.lastParams.difficulty) as 'easy' | 'medium' | 'hard' | undefined;

      const response = await apiService.vocabulary.getAll({
        page: params?.page ?? this.store.page,
        limit: params?.limit ?? this.store.limit,
        search: this.lastParams.search || undefined,
        partOfSpeech: this.lastParams.partOfSpeech === 'all' ? undefined : this.lastParams.partOfSpeech,
        difficulty: difficulty,
        tabId: this.lastParams.tabId || undefined,
        categoryIds: this.lastParams.categoryIds?.length ? this.lastParams.categoryIds : undefined,
        tags: this.lastParams.tags?.length ? this.lastParams.tags : undefined,
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
      // A new word must belong to the active custom tab before reloading its list.
      // Otherwise the save succeeds but the active tab immediately filters it out.
      const activeTabId = this.lastParams.tabId
      if (activeTabId && activeTabId !== 'all') {
        try {
          await apiService.tab.addVocabulary(activeTabId, response.data.id)
        } catch (error) {
          console.error('Vocabulary created, but adding it to the selected tab failed:', error)
          // Keep the saved word accessible in All rather than losing it from view.
          this.lastParams.tabId = null
        }
      }
      websocketService.emit('vocabulary:created', response.data)
      // Newly created words are at the top of the first page, not the old page.
      this.store.setPage(1)
      await this.loadVocabularies({ page: 1, limit: this.store.limit })
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        code: error.response?.data?.code,
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
        code: error.response?.data?.code,
        error: error.response?.data?.message || 'Failed to update vocabulary',
      }
    }
  }

  async deleteSelectedVocabularies(ids: string[]) {
    const uniqueIds = [...new Set(ids)].filter(Boolean)
    // Delete the underlying words, not just their membership in the active tab.
    const results = await Promise.allSettled(uniqueIds.map(id => apiService.vocabulary.delete(id)))
    const deletedIds = uniqueIds.filter((_, index) => results[index]?.status === 'fulfilled')
    const failedIds = uniqueIds.filter((_, index) => results[index]?.status !== 'fulfilled')

    if (deletedIds.length) {
      deletedIds.forEach(id => {
        this.store.removeVocabulary(id)
        websocketService.emit('vocabulary:deleted', { id })
      })
      const remainingTotal = Math.max(0, this.store.total - deletedIds.length)
      const page = Math.max(1, Math.min(this.store.page, Math.ceil(remainingTotal / this.store.limit)))
      this.store.setPage(page)
      await this.loadVocabularies({ page, limit: this.store.limit })
    }
    return { deletedIds, failedIds }
  }

  async deleteVocabulary(id: string) {
    try {
      await apiService.vocabulary.delete(id)
      this.store.removeVocabulary(id)
      websocketService.emit('vocabulary:deleted', { id })
      // Clamp the page when the last word on a page is deleted.
      const remainingTotal = Math.max(0, this.store.total - 1)
      const page = Math.max(1, Math.min(this.store.page, Math.ceil(remainingTotal / this.store.limit)))
      this.store.setPage(page)
      await this.loadVocabularies({ page, limit: this.store.limit })
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete vocabulary',
      }
    }
  }

  async removeVocabularyFromTab(tabId: string, vocabularyId: string) {
    try {
      await apiService.tab.removeVocabulary(tabId, vocabularyId)
      this.store.removeVocabulary(vocabularyId)
      await this.loadVocabularies({ page: this.store.page, limit: this.store.limit })
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove vocabulary from tab',
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
