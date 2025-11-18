import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface PracticeStatistics {
  totalPractices: number
  correctAnswers: number
  incorrectAnswers: number
  accuracy: number
  totalScore: number
  totalTimeSpent: number
  averageTimePerPractice: number
}

export const usePracticeStore = defineStore('practice', () => {
  const statistics = ref<PracticeStatistics | null>(null)
  const loading = ref(false)

  function setStatistics(data: PracticeStatistics) {
    statistics.value = data
  }

  function setLoading(state: boolean) {
    loading.value = state
  }

  return {
    statistics,
    loading,
    setStatistics,
    setLoading,
  }
})
