import { ref } from 'vue'

export function useTagDetailState() {
    const tag = ref<any>(null)
    const vocabularies = ref<any[]>([])
    const loading = ref(true)
    const error = ref<string | null>(null)

    function setTag(data: any) {
        tag.value = data
    }

    function setVocabularies(data: any[]) {
        vocabularies.value = data
    }

    function setLoading(value: boolean) {
        loading.value = value
    }

    function setError(message: string | null) {
        error.value = message
    }

    return {
        tag,
        vocabularies,
        loading,
        error,
        setTag,
        setVocabularies,
        setLoading,
        setError,
    }
}
