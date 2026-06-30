import type { ProductSpecificationDTO } from './ProductSpecificationDTO'

export interface productCreateDTO {
  name: string
  model: string
  description?: string
  subcategory_id: string
  brand_id: string
  specifications: ProductSpecificationDTO[]
}
