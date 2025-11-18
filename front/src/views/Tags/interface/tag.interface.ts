export interface Tag {
  id: string
  name: string
  description?: string
  color?: string
  createdAt: string
  updatedAt: string
}

export interface TagForm {
  name: string
  description: string
  color: string
}
