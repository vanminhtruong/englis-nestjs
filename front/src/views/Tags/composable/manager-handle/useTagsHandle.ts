import { tagsService } from '../../service/tags.service'
import type { TagForm } from '../../interface/tag.interface'
import { useToast } from '../../../../composables/useToast'

export function useTagsHandle(
  form: TagForm,
  isEditing: { value: boolean },
  editingId: { value: string | null },
  closeModal: () => void,
  addTag: (tag: any) => void,
  updateTag: (id: string, tag: any) => void,
  removeTag: (id: string) => void,
) {
  const { showError, showSuccess, confirm } = useToast()

  async function handleSubmit() {
    if (!form.name) {
      showError('Please enter tag name')
      return
    }

    const data = { ...form }
    let result

    try {
      if (isEditing.value && editingId.value) {
        result = await tagsService.updateTag(editingId.value, data)
        if (result.success) {
          updateTag(editingId.value, result.data)
          showSuccess('Tag updated successfully')
        }
      } else {
        result = await tagsService.createTag(data)
        if (result.success) {
          addTag(result.data)
          showSuccess('Tag created successfully')
        }
      }

      if (result.success) {
        closeModal()
      } else {
        showError(result.error || 'Failed to save tag')
      }
    } catch (error) {
      showError('Failed to save tag')
    }
  }

  async function handleDelete(id: string) {
    confirm('Are you sure you want to delete this tag?', async () => {
      const result = await tagsService.deleteTag(id)
      if (result.success) {
        removeTag(id)
        showSuccess('Tag deleted successfully')
      } else {
        showError(result.error || 'Failed to delete tag')
      }
    }, { label: 'Delete', type: 'error' })
  }

  return {
    handleSubmit,
    handleDelete,
  }
}
