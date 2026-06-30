import type { paginatedResponseI } from '../base/PaginationInterface'

export interface movementShortI {
  id: number | string
  type: string
  reason: string
  date: string
  time: string
}

export type movementsShortI = paginatedResponseI<movementShortI>
