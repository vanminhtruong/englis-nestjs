import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { categoriesService } from '../../service/categories.service'
import { CATEGORY_PAGE_SIZE, defaultCategoryFilters, emptyCategorySmartSummary, type Category, type CategoryFilters } from '../../interface/category.interface'

export function useCategoriesQuery() {
  const categories = ref<Category[]>([])
  const filters = reactive<CategoryFilters>(defaultCategoryFilters())
  const page = ref(1)
  const pageCount = ref(1)
  const total = ref(0)
  const totalCategories = ref(0)
  const smartSummary = ref(emptyCategorySmartSummary())
  const loading = ref(true)
  const error = ref(false)
  const hasFilters = computed(() => !!filters.search.trim() || filters.scope !== 'all' || filters.pinned !== 'all' || filters.content !== 'all' || filters.iconType !== 'all' || !!filters.color || filters.sort !== 'default' || filters.smart !== 'all')
  let revision = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let disposed = false

  async function load() {
    if (disposed) return
    clearTimeout(timer)
    const request = ++revision
    loading.value = true
    error.value = false
    const result = await categoriesService.loadPage({ ...filters, search: filters.search.trim(), page: page.value })
    if (disposed || request !== revision) return
    if (result.success && result.data) {
      categories.value = result.data.data
      total.value = result.data.total
      totalCategories.value = result.data.totalCategories
      smartSummary.value = result.data.smartSummary ?? emptyCategorySmartSummary()
      page.value = result.data.page
      pageCount.value = result.data.pageCount
    } else {
      error.value = true
      categories.value = []
    }
    loading.value = false
  }

  function schedule(delay = 120) {
    if (disposed) return
    revision++
    clearTimeout(timer)
    loading.value = true
    error.value = false
    timer = setTimeout(() => { void load() }, delay)
  }

  function updateFilters(next: Partial<CategoryFilters>) {
    const searchChanged = next.search !== undefined && next.search !== filters.search
    Object.assign(filters, next)
    page.value = 1
    schedule(searchChanged ? 300 : 0)
  }

  function resetFilters() { updateFilters(defaultCategoryFilters()) }
  function changePage(value: number) {
    if (value === page.value || value < 1 || value > pageCount.value) return
    page.value = value
    void load()
  }
  const rangeStart = computed(() => total.value ? (page.value - 1) * CATEGORY_PAGE_SIZE + 1 : 0)
  const rangeEnd = computed(() => Math.min(page.value * CATEGORY_PAGE_SIZE, total.value))

  onBeforeUnmount(() => { disposed = true; revision++; clearTimeout(timer) })
  return { categories, filters, page, pageCount, total, totalCategories, smartSummary, loading, error, hasFilters, rangeStart, rangeEnd, load, schedule, updateFilters, resetFilters, changePage }
}
