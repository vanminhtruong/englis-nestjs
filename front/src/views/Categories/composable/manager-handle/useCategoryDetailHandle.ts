import { getPreferredVoice } from '../../../../composables/usePreferredVoice'

export function useCategoryDetailHandle(
    showDetailModal: any,
    selectedVocabulary: any,
    imagePreview: any,
    videoPreview: any
) {
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

    function handleSpeak(word: string) {
        if (!('speechSynthesis' in window)) return
        const utterance = new SpeechSynthesisUtterance(word)
        const voice = getPreferredVoice('en-US')
        if (voice) {
            utterance.voice = voice
            utterance.lang = voice.lang
        } else {
            utterance.lang = 'en-US'
        }
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
    }

    function getVideoThumbnail(videoUrl: string) {
        if (!videoUrl) return ''

        // YouTube URL
        if (videoUrl.includes('youtube.com/embed/')) {
            const videoId = videoUrl.split('youtube.com/embed/')[1]?.split('?')[0]
            if (videoId)
                return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }

        // Vimeo URL
        if (videoUrl.includes('vimeo.com')) {
            const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0]
            if (videoId) return `https://vimeo.com/api/v2/video/${videoId}.json`
        }

        return ''
    }

    return {
        openDetailModal,
        closeDetailModal,
        openImagePreview,
        closeImagePreview,
        openVideoPreview,
        closeVideoPreview,
        handleSpeak,
        getVideoThumbnail,
    }
}
