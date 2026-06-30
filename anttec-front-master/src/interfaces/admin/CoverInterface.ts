import type { paginatedResponseI } from './base/PaginationInterface'

export interface coverI {
  id: number | string
  title: string
  start_at: string
  end_at: string | null
  status: boolean
  order: number | string
  image: string
  imgLoaded?: boolean
}

export type coversI = paginatedResponseI<coverI>
