import apiService from '../../../services/api.service'
import { websocketService } from '../../../services/websocket.service'
import type { Tag, TagForm } from '../interface/tag.interface'

export class TagsService {
  private listeners: Map<string, Function> = new Map()

  async loadTags() {
    try {
      const response = await apiService.tag.getAll()
      return { success: true, data: response.data as Tag[] }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load tags',
      }
    }
  }

  async createTag(data: Partial<TagForm>) {
    try {
      const response = await apiService.tag.create(data)
      return { success: true, data: response.data as Tag }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create tag',
      }
    }
  }

  async updateTag(id: string, data: Partial<TagForm>) {
    try {
      const response = await apiService.tag.update(id, data)
      return { success: true, data: response.data as Tag }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update tag',
      }
    }
  }

  async deleteTag(id: string) {
    try {
      await apiService.tag.delete(id)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete tag',
      }
    }
  }

  setupWebSocketListeners(
    onCreated: (tag: Tag) => void,
    onUpdated: (tag: Tag) => void,
    onDeleted: (data: { id: string }) => void,
  ) {
    const createdHandler = (data: Tag) => onCreated(data)
    const updatedHandler = (data: Tag) => onUpdated(data)
    const deletedHandler = (data: { id: string }) => onDeleted(data)

    websocketService.on('tag:created', createdHandler)
    websocketService.on('tag:updated', updatedHandler)
    websocketService.on('tag:deleted', deletedHandler)

    this.listeners.set('created', createdHandler)
    this.listeners.set('updated', updatedHandler)
    this.listeners.set('deleted', deletedHandler)
  }

  cleanupWebSocketListeners() {
    const createdHandler = this.listeners.get('created')
    const updatedHandler = this.listeners.get('updated')
    const deletedHandler = this.listeners.get('deleted')

    if (createdHandler) websocketService.off('tag:created', createdHandler)
    if (updatedHandler) websocketService.off('tag:updated', updatedHandler)
    if (deletedHandler) websocketService.off('tag:deleted', deletedHandler)

    this.listeners.clear()
  }
}

export const tagsService = new TagsService()
