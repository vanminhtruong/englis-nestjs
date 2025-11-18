<template>
  <VocabularyModal
    v-if="show && vocabularyData"
    :show="show"
    :isEditing="mode === 'edit'"
    :form="form"
    :t="t"
    @submit="handleSubmit"
    @close="handleClose"
  />
</template>

<script setup lang="ts">
import { ref, watch, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import apiService from '../../../services/api.service'

const VocabularyModal = defineAsyncComponent(() => import('../../Vocabulary/component/VocabularyModal.vue') as any)

const props = defineProps<{
  show: boolean
  vocabularyId: string | null
  mode: 'view' | 'edit'
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { t } = useI18n()
const vocabularyData = ref<any>(null)
const form = ref<any>({
  word: '',
  pronunciation: '',
  meaning: '',
  example: '',
  exampleTranslation: '',
  difficulty: 'medium',
  tags: '',
  image: '',
  categoryIds: [],
})

watch(() => [props.show, props.vocabularyId], async ([newShow, newId]) => {
  if (newShow && newId) {
    await loadVocabulary(newId as string)
  }
}, { immediate: true })

async function loadVocabulary(id: string) {
  try {
    const response = await apiService.vocabulary.getById(id)
    vocabularyData.value = response.data
    
    // Fill form with vocabulary data
    form.value = {
      word: response.data.word || '',
      pronunciation: response.data.pronunciation || '',
      meaning: response.data.translation || '',
      example: response.data.example || '',
      exampleTranslation: response.data.exampleTranslation || '',
      difficulty: response.data.difficulty || 'medium',
      tags: Array.isArray(response.data.tags) ? response.data.tags.join(', ') : response.data.tags || '',
      image: response.data.image || '',
      categoryIds: response.data.categories?.map((c: any) => c.id) || [],
    }
  } catch (error) {
    console.error('Failed to load vocabulary:', error)
    handleClose()
  }
}

async function handleSubmit() {
  if (!vocabularyData.value) return

  try {
    const tags = typeof form.value.tags === 'string' 
      ? form.value.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
      : form.value.tags

    const updateData = {
      word: form.value.word,
      pronunciation: form.value.pronunciation,
      translation: form.value.meaning,
      example: form.value.example,
      exampleTranslation: form.value.exampleTranslation,
      difficulty: form.value.difficulty,
      tags,
      image: form.value.image,
      categoryIds: form.value.categoryIds,
    }

    await apiService.vocabulary.update(vocabularyData.value.id, updateData)
    emit('saved')
  } catch (error) {
    console.error('Failed to update vocabulary:', error)
    alert('Failed to update vocabulary')
  }
}

function handleClose() {
  emit('close')
}
</script>

<script lang="ts">
export default {
  name: 'VocabularyModalWrapper'
}
</script>
