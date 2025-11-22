import { ref, computed } from 'vue'
import type { Category } from '../../interface/category.interface'

export function useCategoryDetailState() {
    const showDetailModal = ref(false)
    const selectedVocabulary = ref(null)
    const category = ref<Category | null>(null)
    const loading = ref(true)

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

    const vocabulariesByDate = computed(() => {
        if (!category.value?.vocabularies) return []

        return [...category.value.vocabularies].sort(
            (a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    })

    return {
        showDetailModal,
        selectedVocabulary,
        category,
        loading,
        imagePreview,
        videoPreview,
        vocabulariesByDate,
    }
}
