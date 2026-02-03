import { ref, reactive, computed } from 'vue'
import { useVocabularyStore } from '../../../../stores/vocabulary.store'
import { useAuthStore } from '../../../../stores/auth.store'
import type { VocabularyForm, VocabularyFilter } from '../../interface/vocabulary.interface'

export function useVocabularyState() {
  const store = useVocabularyStore()
  const authStore = useAuthStore()

  const showModal = ref(false)
  const isEditing = ref(false)
  const editingId = ref<string | null>(null)

  const form = reactive<VocabularyForm>({
    word: '',
    pronunciation: '',
    meaning: '',
    example: '',
    exampleTranslation: '',
    difficulty: 'easy',
    tags: [],
  })

  const filter = reactive<VocabularyFilter>({
    search: '',
    difficulty: 'all',
  })

  const filteredVocabularies = computed(() => store.vocabularies)

  const showDifficultyDropdown = ref(false)
  const showDetailModal = ref(false)
  const selectedVocabulary = ref<any>(null)
  const layoutMode = ref<'grid' | 'list'>(authStore.user?.vocabularyLayout || 'grid')
  const isPersistingLayout = ref(false)
  const isGridLayout = computed(() => layoutMode.value === 'grid')

  const difficultyLabel = computed(() => {
    if (filter.difficulty === 'easy') return 'vocabulary.easy'
    if (filter.difficulty === 'medium') return 'vocabulary.medium'
    if (filter.difficulty === 'hard') return 'vocabulary.hard'
    return 'vocabulary.all'
  })

  function resetForm() {
    form.word = ''
    form.pronunciation = ''
    form.meaning = ''
    form.example = ''
    form.exampleTranslation = ''
    form.difficulty = 'easy'
    form.tags = []
    form.categoryIds = []
  }

  function openCreateModal() {
    resetForm()
    isEditing.value = false
    editingId.value = null
    showModal.value = true
  }

  function openEditModal(vocabulary: any) {
    form.word = vocabulary.word
    form.pronunciation = vocabulary.pronunciation
    form.meaning = vocabulary.meaning
    form.example = vocabulary.example || ''
    form.exampleTranslation = vocabulary.exampleTranslation || ''
    form.difficulty = vocabulary.difficulty
    form.tags = vocabulary.tags || []
    form.categoryIds = vocabulary.categories?.map((c: any) => c.id) || []

    isEditing.value = true
    editingId.value = vocabulary.id
    showModal.value = true
  }

  function closeModal() {
    showModal.value = false
    resetForm()
  }

  function openDetailModal(vocabulary: any) {
    selectedVocabulary.value = vocabulary
    showDetailModal.value = true
  }

  function closeDetailModal() {
    showDetailModal.value = false
    selectedVocabulary.value = null
  }

  function handleEditFromDetail(vocabulary: any) {
    openEditModal(vocabulary)
  }

  function setDifficultyFilter(value: 'all' | 'easy' | 'medium' | 'hard') {
    filter.difficulty = value
    showDifficultyDropdown.value = false
  }

  return {
    store,
    showModal,
    isEditing,
    editingId,
    form,
    filter,
    filteredVocabularies,
    openCreateModal,
    openEditModal,
    closeModal,
    showDifficultyDropdown,
    showDetailModal,
    selectedVocabulary,
    openDetailModal,
    closeDetailModal,
    handleEditFromDetail,
    layoutMode,
    isPersistingLayout,
    isGridLayout,
    difficultyLabel,
    setDifficultyFilter,
  }
}
