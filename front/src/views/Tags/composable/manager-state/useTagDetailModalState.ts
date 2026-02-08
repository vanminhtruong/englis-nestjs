import { ref } from 'vue'

export function useTagDetailModalState() {
    // Detail Modal State
    const detailModal = ref({
        show: false,
        vocabulary: null as any,
    })

    // Image Preview State
    const imagePreview = ref({
        visible: false,
        src: '',
        alt: '',
    })

    // Video Preview State
    const videoPreview = ref({
        visible: false,
        src: '',
        title: '',
    })

    // Detail Modal Handlers
    function openDetailModal(vocab: any) {
        detailModal.value.vocabulary = vocab
        detailModal.value.show = true
    }

    function closeDetailModal() {
        detailModal.value.show = false
        detailModal.value.vocabulary = null
    }

    // Image Preview Handlers
    function openImagePreview(payload: { src: string; alt: string }) {
        imagePreview.value.src = payload.src
        imagePreview.value.alt = payload.alt
        imagePreview.value.visible = true
    }

    function closeImagePreview() {
        imagePreview.value.visible = false
        imagePreview.value.src = ''
        imagePreview.value.alt = ''
    }

    // Video Preview Handlers
    function openVideoPreview(payload: { src: string; title: string }) {
        videoPreview.value.src = payload.src
        videoPreview.value.title = payload.title
        videoPreview.value.visible = true
    }

    function closeVideoPreview() {
        videoPreview.value.visible = false
        videoPreview.value.src = ''
        videoPreview.value.title = ''
    }

    return {
        detailModal,
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
