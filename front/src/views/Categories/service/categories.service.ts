import apiService from '../../../services/api.service'
import { websocketService } from '../../../services/websocket.service'
import type { Category, CategoryForm } from '../interface/category.interface'

export class CategoriesService {
  private listeners: Map<string, Function> = new Map()
  async loadCategories() {
    try {
      const response = await apiService.category.getAll()
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load categories',
      }
    }
  }

  async getCategoryWithVocabularies(id: string) {
    try {
      const response = await apiService.category.getWithVocabularies(id)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load category',
      }
    }
  }

  async createCategory(data: Partial<CategoryForm>) {
    try {
      const response = await apiService.category.create(data)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create category',
      }
    }
  }

  async updateCategory(id: string, data: Partial<CategoryForm>) {
    try {
      const response = await apiService.category.update(id, data)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update category',
      }
    }
  }

  async deleteCategory(id: string) {
    try {
      await apiService.category.delete(id)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete category',
      }
    }
  }

  async togglePin(id: string) {
    try {
      const response = await apiService.category.togglePin(id)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to toggle pin',
      }
    }
  }

  setupWebSocketListeners(
    onCreated: (category: Category) => void,
    onUpdated: (category: Category) => void,
    onDeleted: (data: { id: string }) => void
  ) {
    const createdHandler = (data: Category) => onCreated(data)
    const updatedHandler = (data: Category) => onUpdated(data)
    const deletedHandler = (data: { id: string }) => onDeleted(data)
    const pinnedHandler = (data: Category) => onUpdated(data)

    websocketService.on('category:created', createdHandler)
    websocketService.on('category:updated', updatedHandler)
    websocketService.on('category:deleted', deletedHandler)
    websocketService.on('category:pinned', pinnedHandler)

    this.listeners.set('created', createdHandler)
    this.listeners.set('updated', updatedHandler)
    this.listeners.set('deleted', deletedHandler)
    this.listeners.set('pinned', pinnedHandler)
  }

  cleanupWebSocketListeners() {
    const createdHandler = this.listeners.get('created')
    const updatedHandler = this.listeners.get('updated')
    const deletedHandler = this.listeners.get('deleted')
    const pinnedHandler = this.listeners.get('pinned')

    if (createdHandler) websocketService.off('category:created', createdHandler)
    if (updatedHandler) websocketService.off('category:updated', updatedHandler)
    if (deletedHandler) websocketService.off('category:deleted', deletedHandler)
    if (pinnedHandler) websocketService.off('category:pinned', pinnedHandler)

    this.listeners.clear()
  }
}

export const categoriesService = new CategoriesService()
