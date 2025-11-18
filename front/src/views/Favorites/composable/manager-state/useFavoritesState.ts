import { ref, computed } from 'vue'
import type { Vocabulary } from '../../interface/favorites.interface'

export function useFavoritesState() {
  const favorites = ref<Vocabulary[]>([])
  const loading = ref(true)
  const page = ref(1)
  const limit = ref(6)
  const total = ref(0)
  const pageCount = ref(1)

  const favoritesCount = computed(() => favorites.value.length)
  const hasFavorites = computed(() => favorites.value.length > 0)

  function setFavorites(data: Vocabulary[]) {
    favorites.value = data
  }

  function removeFavorite(id: string) {
    favorites.value = favorites.value.filter(v => v.id !== id)
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  function setMeta(meta: { page: number; limit: number; total: number; pageCount: number }) {
    page.value = meta.page
    limit.value = meta.limit
    total.value = meta.total
    pageCount.value = meta.pageCount
  }

  function setPage(p: number) { page.value = p }
  function setLimit(l: number) { limit.value = l }

  return {
    favorites,
    loading,
    page,
    limit,
    total,
    pageCount,
    favoritesCount,
    hasFavorites,
    setFavorites,
    removeFavorite,
    setLoading,
    setMeta,
    setPage,
    setLimit,
  }
}
