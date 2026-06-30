import type { ProductSpecificationDTO } from './ProductSpecificationDTO'

export interface productUpdateDTO {
  name?: string
  model?: string
  description?: string
  status?: boolean
  subcategory_id?: string
  brand_id?: string
  specifications?: ProductSpecificationDTO[]
}
