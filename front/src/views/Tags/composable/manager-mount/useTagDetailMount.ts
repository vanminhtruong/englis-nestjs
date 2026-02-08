import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiService from '../../../../services/api.service'

interface TagDetailMountParams {
    setTag: (data: any) => void
    setVocabularies: (data: any[]) => void
    setLoading: (value: boolean) => void
    setError: (message: string | null) => void
}

export function useTagDetailMount(params: TagDetailMountParams) {
    const route = useRoute()

    async function fetchTagAndVocabularies() {
        params.setLoading(true)
        params.setError(null)
        const tagId = route.params.id as string

        try {
            // 1. Fetch Tag Details
            const tagResponse = await apiService.tag.getById(tagId)
            const tagData = tagResponse.data

            if (!tagData) {
                params.setError('Tag not found')
                return
            }

            params.setTag(tagData)

            // 2. Fetch Vocabularies by Tag Name
            const vocabResponse = await apiService.vocabulary.getByTags([tagData.name])
            params.setVocabularies(vocabResponse.data || [])
        } catch (err: any) {
            console.error('Error fetching tag details:', err)
            params.setError(
                err.response?.data?.message || 'An error occurred while loading the tag.'
            )
        } finally {
            params.setLoading(false)
        }
    }

    onMounted(() => {
        fetchTagAndVocabularies()
    })

    return {
        fetchTagAndVocabularies,
    }
}
