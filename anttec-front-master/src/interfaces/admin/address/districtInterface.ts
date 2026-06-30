import type { paginatedResponseI } from '../base/PaginationInterface'
import type { generalI } from './generalnterface'

export interface districtI {
  id: number
  name: string
  country: generalI
  department: generalI
  province: generalI
  shipping_rate: shipping_rateI
  status: boolean
}

export interface shipping_rateI {
  id: number
  delivery_price: number
  min_delivery_days: number
  max_delivery_days: number
}

export type districtsI = paginatedResponseI<districtI>
