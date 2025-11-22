import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { categoriesService } from '../../service/categories.service'

export function useCategoryDetailMount(category: any, loading: any) {
    const route = useRoute()

    onMounted(async () => {
        const id = route.params.id as string
        const result = await categoriesService.getCategoryWithVocabularies(id)
        if (result.success) {
            category.value = result.data
        }
        loading.value = false
    })
}
