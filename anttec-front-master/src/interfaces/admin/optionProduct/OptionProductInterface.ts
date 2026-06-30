import type { paginatedResponseI } from '../base/PaginationInterface'

export interface OptionProductI {
  id: number
  product_id: string
  option_id: string
  option_name: string
  option_type: string
  values: OptionProductValueI[]
}

export interface OptionProductValueI {
  id: number
  value: string
  description: string
}

export type OptionProductsI = paginatedResponseI<OptionProductI>
