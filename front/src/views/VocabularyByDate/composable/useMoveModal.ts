import { ref, computed } from 'vue'

export function useMoveModal(vocabulariesByDate: any, formatDate: (date: string) => string, moveCategoryToDate: (fromDate: string, toDate: string, categoryId: string) => Promise<void>) {
  const showMoveModal = ref(false)
  const moveFromDate = ref('')
  const moveCategoryId = ref('')
  const moveCategoryName = ref('')
  const selectedTargetDate = ref('')
  const showTargetDateDropdown = ref(false)

  const availableTargetDates = computed(() => {
    if (!moveFromDate.value) return []
    return vocabulariesByDate.value
      .map((g: any) => g.date)
      .filter((d: string) => d !== moveFromDate.value)
  })

  const availableDatesFormatted = computed(() => {
    return availableTargetDates.value.map((date: string) => ({
      value: date,
      label: formatDate(date),
    }))
  })

  function openMoveModal(date: string, categoryId: string, categoryName: string) {
    moveFromDate.value = date
    moveCategoryId.value = categoryId
    moveCategoryName.value = categoryName
    selectedTargetDate.value = ''
    showTargetDateDropdown.value = false
    showMoveModal.value = true
  }

  function closeMoveModal() {
    showMoveModal.value = false
    showTargetDateDropdown.value = false
  }

  async function confirmMove() {
    if (!selectedTargetDate.value || !moveFromDate.value || !moveCategoryId.value) return
    await moveCategoryToDate(moveFromDate.value, selectedTargetDate.value, moveCategoryId.value)
    showMoveModal.value = false
    showTargetDateDropdown.value = false
  }

  function selectTargetDate(date: string) {
    selectedTargetDate.value = date
    showTargetDateDropdown.value = false
  }

  function toggleDropdown() {
    showTargetDateDropdown.value = !showTargetDateDropdown.value
  }

  return {
    showMoveModal,
    moveFromDate,
    moveCategoryId,
    moveCategoryName,
    selectedTargetDate,
    showTargetDateDropdown,
    availableTargetDates,
    availableDatesFormatted,
    openMoveModal,
    closeMoveModal,
    confirmMove,
    selectTargetDate,
    toggleDropdown,
  }
}
