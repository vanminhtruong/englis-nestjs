import { reactive } from 'vue'

interface ImagePreview {
    visible: boolean
    src: string
    alt: string
    title: string
}

interface VideoPreview {
    visible: boolean
    src: string
    title: string
}

export function useMediaPreview() {
    const imagePreview = reactive<ImagePreview>({
        visible: false,
        src: '',
        alt: '',
        title: '',
    })

    const videoPreview = reactive<VideoPreview>({
        visible: false,
        src: '',
        title: '',
    })

    function openImagePreview(payload: { src: string; alt: string }) {
        imagePreview.src = payload.src
        imagePreview.alt = payload.alt
        imagePreview.title = payload.alt
        imagePreview.visible = true
    }

    function closeImagePreview() {
        imagePreview.visible = false
    }

    function openVideoPreview(payload: { src: string; title: string }) {
        videoPreview.src = payload.src
        videoPreview.title = payload.title
        videoPreview.visible = true
    }

    function closeVideoPreview() {
        videoPreview.visible = false
    }

    return {
        imagePreview,
        videoPreview,
        openImagePreview,
        closeImagePreview,
        openVideoPreview,
        closeVideoPreview,
    }
}
