import type { paginatedResponseI } from './base/PaginationInterface'

export interface categoryI {
  id: number
  name: string
  status: boolean
}

export interface categorySubI {
  id: number
  name: string
}

export type categoriesI = paginatedResponseI<categoryI>
