export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  isPinned?: boolean
  pinnedAt?: string | null
  vocabularyCount?: number
  smart?: CategorySmartInfo
  vocabularies?: any[]
  createdAt: string
  updatedAt: string
}

export interface CategoryForm {
  name: string
  description: string
  color: string
  icon: string
}

export const CATEGORY_PAGE_SIZE = 8

export type CategorySmartMode = 'all' | 'recommended' | 'interested' | 'neglected'
export interface CategorySmartInfo {
  recentActivityCount: number
  idleDays: number
  hasStudied: boolean
  needsReview: boolean
  isInterested: boolean
}
export interface CategorySmartSummary { interested: number; neglected: number; recommended: number }
export const emptyCategorySmartSummary = (): CategorySmartSummary => ({ interested: 0, neglected: 0, recommended: 0 })

export interface CategoryFilters {
  smart: CategorySmartMode
  search: string
  scope: 'all' | 'name' | 'description' | 'vocabulary'
  pinned: 'all' | 'pinned' | 'unpinned'
  content: 'all' | 'empty' | 'populated'
  iconType: 'all' | 'preset' | 'custom'
  color: string
  sort: 'default' | 'newest' | 'oldest' | 'nameAsc' | 'nameDesc' | 'mostWords' | 'fewestWords' | 'updated'
}
export const defaultCategoryFilters = (): CategoryFilters => ({
  smart: 'all', search: '', scope: 'all', pinned: 'all', content: 'all', iconType: 'all', color: '', sort: 'default',
})
export interface CategoryPageQuery extends CategoryFilters { page: number }
export interface CategoryPage {
  data: Category[]
  page: number
  pageCount: number
  total: number
  totalCategories: number
  smartSummary?: CategorySmartSummary
  limit: number
}
export type CategoryBulkAction = 'pin' | 'unpin' | 'delete'
export interface CategoryBulkResult { processedIds: string[]; failedIds: string[] }
