import { ref, computed, reactive } from 'vue'
import type { Category, CategoryForm } from '../../interface/category.interface'

export function useCategoriesState() {
  const categories = ref<Category[]>([])
  const loading = ref(true)
  const showModal = ref(false)
  const isEditing = ref(false)
  const editingId = ref<string | null>(null)

  const form = reactive<CategoryForm>({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'book',
  })

  const categoriesCount = computed(() => categories.value.length)
  const hasCategories = computed(() => categories.value.length > 0)

  function setCategories(data: Category[]) {
    categories.value = sortCategories(data)
  }

  function addCategory(category: Category) {
    categories.value = sortCategories([category, ...categories.value])
  }

  function updateCategory(id: string, category: Category) {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      categories.value[index] = category
      categories.value = sortCategories(categories.value)
    }
  }

  function removeCategory(id: string) {
    categories.value = categories.value.filter(c => c.id !== id)
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  function openCreateModal() {
    isEditing.value = false
    editingId.value = null
    form.name = ''
    form.description = ''
    form.color = '#3B82F6'
    form.icon = 'book'
    showModal.value = true
  }

  function openEditModal(category: Category) {
    isEditing.value = true
    editingId.value = category.id
    form.name = category.name
    form.description = category.description || ''
    form.color = category.color || '#3B82F6'
    form.icon = category.icon || 'book'
    showModal.value = true
  }

  function closeModal() {
    showModal.value = false
  }

  function sortCategories(list: Category[]) {
    return [...list].sort((a, b) => {
      const ap = a.isPinned ? 1 : 0
      const bp = b.isPinned ? 1 : 0
      if (ap !== bp) return bp - ap
      const at = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0
      const bt = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0
      if (at !== bt) return bt - at
      const ac = new Date(a.createdAt).getTime()
      const bc = new Date(b.createdAt).getTime()
      return bc - ac
    })
  }

  return {
    categories,
    loading,
    showModal,
    isEditing,
    editingId,
    form,
    categoriesCount,
    hasCategories,
    setCategories,
    addCategory,
    updateCategory,
    removeCategory,
    setLoading,
    openCreateModal,
    openEditModal,
    closeModal,
  }
}
