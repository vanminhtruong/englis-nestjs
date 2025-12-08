import { onMounted } from 'vue'

export function usePracticeMount(loadPracticeModes?: () => Promise<void>) {
  onMounted(async () => {
    // Practice modes are now hardcoded in usePracticeState.ts
    // No need to load from database anymore
    // This function call is kept for compatibility but is now a no-op
    if (loadPracticeModes) {
      await loadPracticeModes()
    }
  })
}
