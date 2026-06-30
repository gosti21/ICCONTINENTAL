import type { paginatedResponseI } from './base/PaginationInterface'

export interface subcategoryI {
  id: number
  name: string
  category_id: number
  status: boolean
  category: {
    id: number
    name: string
  }
}
export type subcategoriesI = paginatedResponseI<subcategoryI>
