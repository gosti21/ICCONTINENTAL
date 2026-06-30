import type { paginatedResponseI } from './base/PaginationInterface'

export interface courierI {
  id: number
  name: string
  email: string
  district: string
  street: string
  reference: string
  phone: string | number
  status: boolean
}

export type couriersI = paginatedResponseI<courierI>
