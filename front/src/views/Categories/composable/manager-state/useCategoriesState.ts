import { ref, reactive } from 'vue'
import type { Category, CategoryForm } from '../../interface/category.interface'

export function useCategoriesState() {
  const showModal = ref(false)
  const isEditing = ref(false)
  const editingId = ref<string | null>(null)
  const form = reactive<CategoryForm>({ name: '', description: '', color: '#3B82F6', icon: 'book' })

  function openCreateModal() {
    isEditing.value = false
    editingId.value = null
    Object.assign(form, { name: '', description: '', color: '#3B82F6', icon: 'book' })
    showModal.value = true
  }
  function openEditModal(category: Category) {
    isEditing.value = true
    editingId.value = category.id
    Object.assign(form, { name: category.name, description: category.description || '', color: category.color || '#3B82F6', icon: category.icon || 'book' })
    showModal.value = true
  }
  function closeModal() { showModal.value = false }
  return { showModal, isEditing, editingId, form, openCreateModal, openEditModal, closeModal }
}
