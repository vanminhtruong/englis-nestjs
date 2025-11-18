import { ref, computed, reactive } from 'vue'
import type { Tag, TagForm } from '../../interface/tag.interface'

export function useTagsState() {
  const tags = ref<Tag[]>([])
  const loading = ref(true)
  const showModal = ref(false)
  const isEditing = ref(false)
  const editingId = ref<string | null>(null)

  const form = reactive<TagForm>({
    name: '',
    description: '',
    color: '#A855F7',
  })

  const tagsCount = computed(() => tags.value.length)
  const hasTags = computed(() => tags.value.length > 0)

  function setTags(data: Tag[]) {
    tags.value = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  function addTag(tag: Tag) {
    tags.value = [tag, ...tags.value.filter(t => t.id !== tag.id)]
  }

  function updateTag(id: string, tag: Tag) {
    const index = tags.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tags.value[index] = tag
      setTags(tags.value)
    }
  }

  function removeTag(id: string) {
    tags.value = tags.value.filter(t => t.id !== id)
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  function openCreateModal() {
    isEditing.value = false
    editingId.value = null
    form.name = ''
    form.description = ''
    form.color = '#A855F7'
    showModal.value = true
  }

  function openEditModal(tag: Tag) {
    isEditing.value = true
    editingId.value = tag.id
    form.name = tag.name
    form.description = tag.description || ''
    form.color = tag.color || '#A855F7'
    showModal.value = true
  }

  function closeModal() {
    showModal.value = false
  }

  return {
    tags,
    loading,
    showModal,
    isEditing,
    editingId,
    form,
    tagsCount,
    hasTags,
    setTags,
    addTag,
    updateTag,
    removeTag,
    setLoading,
    openCreateModal,
    openEditModal,
    closeModal,
  }
}
