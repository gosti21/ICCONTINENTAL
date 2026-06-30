import type { paginatedResponseI } from './base/PaginationInterface'

export interface orderI {
  id: number | string
  order_number: string
  date: string | Date
  type_sale: string
  total: string | number
  status: string
  status_en: 'confirmed' | 'processing' | 'ready' | 'completed' | 'refunded' | 'cancelled'
  payment_status: string
  customer: string
  delivery_type: string
}

export type ordersI = paginatedResponseI<orderI>
