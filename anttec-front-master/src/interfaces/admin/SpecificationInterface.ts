import type { paginatedResponseI } from './base/PaginationInterface'

export interface SpecificationI {
  id: number
  name: string
  status: boolean
}

export type SpecificationsI = paginatedResponseI<SpecificationI>
