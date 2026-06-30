import type { paginatedResponseI } from '../base/PaginationInterface'

export interface districtShortI {
  id: number
  name: string
  country: string
  department: string
  province: string
  delivery_price: number
  status: boolean
}

export type districtShortsI = paginatedResponseI<districtShortI>
