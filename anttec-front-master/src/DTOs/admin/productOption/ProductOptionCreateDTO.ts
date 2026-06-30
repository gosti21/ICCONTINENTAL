import type { ProductOptionValuesDTO } from './productOptionValuesDTO'

export interface productOptionCreateDTO {
  product_id: string | number
  option_id: string | number
  values: ProductOptionValuesDTO[]
}
