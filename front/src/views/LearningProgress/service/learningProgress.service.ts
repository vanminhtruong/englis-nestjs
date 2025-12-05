import { apiClient } from '../../../services/api.service'
import type { LearningProgressData } from '../interface/types'

export const learningProgressService = {
    async getProgress(): Promise<LearningProgressData> {
        const response = await apiClient.get('/learning-progress')
        return response.data
    },
}
