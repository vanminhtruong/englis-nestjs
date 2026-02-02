import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  // Auth endpoints
  auth: {
    register: (data: any) => apiClient.post('/auth/register', data),
    login: (data: any) => apiClient.post('/auth/login', data),
    getProfile: () => apiClient.get('/auth/me'),
    updateTheme: (theme: string) => apiClient.put('/auth/theme', { theme }),
    updateVocabularyLayout: (layout: 'grid' | 'list') =>
      apiClient.put('/auth/layout', { layout }),
    updateCategoriesLayout: (layout: 'grid' | 'list') =>
      apiClient.put('/auth/categories-layout', { layout }),
    recalculateWords: () => apiClient.post('/auth/recalculate-words'),
    updateProfile: (data: any) => apiClient.put('/auth/profile', data),
    exportData: () => apiClient.get('/auth/export', { responseType: 'blob' }),
    importData: (formData: FormData) =>
      apiClient.post('/auth/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
  },

  // Vocabulary endpoints
  vocabulary: {
    getAll: (params?: { page?: number; limit?: number; search?: string; difficulty?: 'easy' | 'medium' | 'hard' }) =>
      apiClient.get('/vocabulary', { params }),
    getById: (id: string) => apiClient.get(`/vocabulary/${id}`),
    create: (data: any) => apiClient.post('/vocabulary', data),
    update: (id: string, data: any) => apiClient.put(`/vocabulary/${id}`, data),
    delete: (id: string) => apiClient.delete(`/vocabulary/${id}`),
    toggleFavorite: (id: string) => apiClient.put(`/vocabulary/${id}/favorite`),
    togglePin: (id: string) => apiClient.patch(`/vocabulary/${id}/pin`),
    getFavorites: (params?: { page?: number; limit?: number }) =>
      apiClient.get('/vocabulary/favorites/list', { params }),
    getForPractice: (limit: number = 10) =>
      apiClient.get(`/vocabulary/practice?limit=${limit}`),
    getByTags: (tags: string[]) =>
      apiClient.get(`/vocabulary/tags?tags=${tags.join(',')}`),
    getByLearningDate: () => apiClient.get('/vocabulary/by-learning-date'),
    moveByLearningDate: (data: { fromDate: string; toDate: string; categoryId: string }) =>
      apiClient.post('/vocabulary/move-by-date', data),
    updateCategoryTopic: (data: { date: string; topic: string; icon?: string; color?: string }) =>
      apiClient.put('/vocabulary/category-topic/update', data),
    updateFilterState: (isExpanded: boolean) =>
      apiClient.patch('/vocabulary/settings/filter-state', { isExpanded }),
  },

  practice: {
    submit: (data: any) => apiClient.post('/practice/submit', data),
    // getModes removed - practice modes are now hardcoded in frontend
    saveIncomplete: (data: any) => apiClient.post('/practice/save-incomplete', data),
  },

  // History endpoints (unified history for all activities)
  history: {
    getAll: (params?: { page?: number; limit?: number }) => apiClient.get('/history', { params }),
    getStatistics: () => apiClient.get('/history/statistics'),
    delete: (id: string) => apiClient.delete(`/history/${id}`),
    deleteMany: (ids: string[]) => apiClient.post('/history/delete-many', { ids }),
    deleteAll: () => apiClient.delete('/history/all'),
  },

  // Category endpoints
  category: {
    getAll: () => apiClient.get('/category'),
    getById: (id: string) => apiClient.get(`/category/${id}`),
    getWithVocabularies: (id: string) => apiClient.get(`/category/${id}/vocabularies`),
    create: (data: any) => apiClient.post('/category', data),
    update: (id: string, data: any) => apiClient.put(`/category/${id}`, data),
    delete: (id: string) => apiClient.delete(`/category/${id}`),
    togglePin: (id: string) => apiClient.patch(`/category/${id}/pin`),
  },

  // Tag endpoints
  tag: {
    getAll: () => apiClient.get('/tag'),
    create: (data: any) => apiClient.post('/tag', data),
    update: (id: string, data: any) => apiClient.put(`/tag/${id}`, data),
    delete: (id: string) => apiClient.delete(`/tag/${id}`),
  },

  // Voice endpoints
  voice: {
    getAll: () => apiClient.get('/voice'),
    setPreferred: (voiceKey: string) => apiClient.post('/voice/preferred', { voiceKey }),
  },

  // Background endpoints
  background: {
    getAll: (category?: string) => apiClient.get('/backgrounds', { params: category ? { category } : {} }),
    getCategories: () => apiClient.get('/backgrounds/categories'),
    getById: (id: string) => apiClient.get(`/backgrounds/${id}`),
  },
}
