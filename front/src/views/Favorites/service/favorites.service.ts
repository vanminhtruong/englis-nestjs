import apiService from '../../../services/api.service'

export class FavoritesService {
  async loadFavorites(params?: { page?: number; limit?: number }) {
    try {
      const response = await apiService.vocabulary.getFavorites({
        page: params?.page,
        limit: params?.limit,
      })
      const { data, meta } = response.data
      return { success: true, data, meta }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load favorites',
      }
    }
  }

  async toggleFavorite(id: string) {
    try {
      const response = await apiService.vocabulary.toggleFavorite(id)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to toggle favorite',
      }
    }
  }
}

export const favoritesService = new FavoritesService()
