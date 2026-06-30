import type { paginatedResponseI } from './base/PaginationInterface'

export interface brandI {
  id: number
  name: string
  status: boolean
}

export type brandsI = paginatedResponseI<brandI>
