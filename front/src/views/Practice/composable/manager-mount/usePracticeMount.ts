import { onMounted } from 'vue'

export function usePracticeMount(loadPracticeModes?: () => Promise<void>) {
  onMounted(async () => {
    // Load practice modes from database
    if (loadPracticeModes) {
      await loadPracticeModes()
    }
  })
}
