import { onMounted, onUnmounted } from 'vue'
import { tagsService } from '../../service/tags.service'

export function useTagsMount(
  setTags: (data: any[]) => void,
  setLoading: (value: boolean) => void,
  addTag: (tag: any) => void,
  updateTag: (id: string, tag: any) => void,
  removeTag: (id: string) => void,
) {
  onMounted(async () => {
    setLoading(true)
    const result = await tagsService.loadTags()
    if (result.success && result.data) {
      setTags(result.data)
    }
    setLoading(false)

    tagsService.setupWebSocketListeners(
      (tag) => {
        addTag(tag)
      },
      (tag) => {
        updateTag(tag.id, tag)
      },
      (data) => {
        removeTag(data.id)
      },
    )
  })

  onUnmounted(() => {
    tagsService.cleanupWebSocketListeners()
  })
}
