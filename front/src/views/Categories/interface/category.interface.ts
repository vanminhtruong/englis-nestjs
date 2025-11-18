export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  isPinned?: boolean
  pinnedAt?: string | null
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
