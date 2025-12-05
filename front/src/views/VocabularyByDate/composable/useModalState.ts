import { ref } from 'vue'

export function useModalState() {
  const showDetailModal = ref(false)
  const selectedVocabulary = ref(null)
  
  const imagePreview = ref({
    visible: false,
    src: '',
    alt: '',
  })
  
  const videoPreview = ref({
    visible: false,
    src: '',
    title: '',
  })

  function openDetailModal(vocab: any) {
    selectedVocabulary.value = vocab
    showDetailModal.value = true
  }

  function closeDetailModal() {
    showDetailModal.value = false
    selectedVocabulary.value = null
  }

  function openImagePreview(payload: { src: string; alt: string }) {
    imagePreview.value.src = payload.src
    imagePreview.value.alt = payload.alt
    imagePreview.value.visible = true
  }

  function closeImagePreview() {
    imagePreview.value.visible = false
  }

  function openVideoPreview(payload: { src: string; title: string }) {
    videoPreview.value.src = payload.src
    videoPreview.value.title = payload.title
    videoPreview.value.visible = true
  }

  function closeVideoPreview() {
    videoPreview.value.visible = false
  }

  return {
    showDetailModal,
    selectedVocabulary,
    imagePreview,
    videoPreview,
    openDetailModal,
    closeDetailModal,
    openImagePreview,
    closeImagePreview,
    openVideoPreview,
    closeVideoPreview,
  }
}
