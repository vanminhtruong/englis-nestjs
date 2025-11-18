import apiService from '../../../services/api.service'
import { websocketService } from '../../../services/websocket.service'
import type { DateOption } from '../interface/practice.interface'

export interface PracticeMode {
  id: string
  key: string
  name: string
  description: string
  icon: string
  color: string
  isActive: boolean
  sortOrder: number
}

export class PracticeService {
  async getVocabulariesForPractice(limit: number = 10) {
    try {
      const response = await apiService.vocabulary.getForPractice(limit)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load vocabularies',
      }
    }
  }

  async getAvailableDates(): Promise<{ success: boolean; data?: DateOption[]; error?: string }> {
    try {
      const response = await apiService.vocabulary.getByLearningDate()
      const dateOptions: DateOption[] = response.data.map((item: any) => ({
        date: item.date,
        count: item.count,
        formattedDate: new Date(item.date).toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }))
      return { success: true, data: dateOptions }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load available dates',
      }
    }
  }

  async getVocabulariesByDate(date: string, limit: number = 10): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await apiService.vocabulary.getByLearningDate()
      const dateGroup = response.data.find((item: any) => item.date === date)
      
      if (!dateGroup) {
        return { success: false, error: 'No vocabularies found for this date' }
      }

      // Flatten vocabularies from all categories for this date
      const vocabularies: any[] = []
      dateGroup.vocabularies?.forEach((vocab: any) => {
        vocabularies.push(vocab)
      })

      // Shuffle and limit
      const shuffled = vocabularies.sort(() => Math.random() - 0.5)
      const limited = shuffled.slice(0, limit)

      return { success: true, data: limited }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load vocabularies by date',
      }
    }
  }

  async getPracticeModes(): Promise<{ success: boolean; data?: PracticeMode[]; error?: string }> {
    try {
      const response = await apiService.practice.getModes()
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load practice modes',
      }
    }
  }

  async submitPractice(data: any) {
    try {
      const response = await apiService.practice.submit(data)
      websocketService.emit('practice:completed', response.data)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit practice',
      }
    }
  }
}

export const practiceService = new PracticeService()
