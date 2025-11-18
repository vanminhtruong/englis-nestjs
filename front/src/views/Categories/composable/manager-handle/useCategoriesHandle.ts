import { categoriesService } from '../../service/categories.service'
import type { CategoryForm } from '../../interface/category.interface'
import { useToast } from '../../../../composables/useToast'

export function useCategoriesHandle(
  form: CategoryForm,
  isEditing: { value: boolean },
  editingId: { value: string | null },
  closeModal: () => void,
  addCategory: (category: any) => void,
  updateCategory: (id: string, category: any) => void,
  removeCategory: (id: string) => void
) {
  const { showError, showSuccess, confirm } = useToast()

  async function handleSubmit() {
    if (!form.name) {
      showError('Please enter category name')
      return
    }

    const data = { ...form }
    let result

    try {
      if (isEditing.value && editingId.value) {
        result = await categoriesService.updateCategory(editingId.value, data)
        if (result.success) {
          updateCategory(editingId.value, result.data)
          showSuccess('Category updated successfully')
        }
      } else {
        result = await categoriesService.createCategory(data)
        if (result.success) {
          addCategory(result.data)
          showSuccess('Category created successfully')
        }
      }

      if (result.success) {
        closeModal()
      } else {
        showError(result.error || 'Failed to save category')
      }
    } catch (error) {
      showError('Failed to save category')
    }
  }

  async function handleDelete(id: string) {
    confirm('Are you sure you want to delete this category?', async () => {
      const result = await categoriesService.deleteCategory(id)
      if (result.success) {
        removeCategory(id)
        showSuccess('Category deleted successfully')
      } else {
        showError(result.error || 'Failed to delete category')
      }
    }, { label: 'Delete', type: 'error' })
  }

  async function handleTogglePin(id: string) {
    const result = await categoriesService.togglePin(id)
    if (result.success) {
      updateCategory(id, result.data)
      showSuccess('Category updated successfully')
    } else {
      showError(result.error || 'Failed to update category')
    }
  }

  return {
    handleSubmit,
    handleDelete,
    handleTogglePin,
  }
}
