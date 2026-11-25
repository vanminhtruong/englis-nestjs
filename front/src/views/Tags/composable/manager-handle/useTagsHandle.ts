import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { tagsService } from '../../service/tags.service'
import type { Tag, TagForm } from '../../interface/tag.interface'
import { useToast } from '../../../../composables/useToast'

export function useTagsHandle(
  form: TagForm,
  isEditing: { value: boolean },
  editingId: { value: string | null },
  closeModal: () => void,
  addTag: (tag: Tag) => void,
  updateTag: (id: string, tag: Tag) => void,
  removeTag: (id: string) => void,
) {
  const { showError, showSuccess, confirm } = useToast()
  const { t } = useI18n()
  const saving = ref(false)
  async function handleSubmit() {
    if (saving.value) return
    if (!form.name.trim()) { showError(t('tags.nameRequired')); return }
    const data = { ...form, name: form.name.trim(), description: form.description.trim() }
    const id = isEditing.value ? editingId.value : null
    saving.value = true
    try {
      const result = id ? await tagsService.updateTag(id, data) : await tagsService.createTag(data)
      if (result.success && result.data) {
        if (id) updateTag(id, result.data)
        else addTag(result.data)
        showSuccess(t(id ? 'tags.updated' : 'tags.created'))
        closeModal()
      } else showError(result.error || t('tags.saveFailed'))
    } catch { showError(t('tags.saveFailed')) }
    finally { saving.value = false }
  }
  async function handleDelete(id: string) {
    confirm(t('tags.deleteConfirm'), async () => {
      const result = await tagsService.deleteTag(id)
      if (result.success) {
        removeTag(id)
        showSuccess(t('tags.deleted'))
      } else showError(result.error || t('tags.deleteFailed'))
    }, { label: t('tags.delete'), type: 'error' })
  }
  return { handleSubmit, handleDelete, saving }
}
