import type { paginatedResponseI } from './base/PaginationInterface'

export interface saleI {
  id: number
  type_voucher: string
  order_number: string
  type_sale: string
  total: string | number
  employee: string
  customer: string
  path: string
}

export type salesI = paginatedResponseI<saleI>
