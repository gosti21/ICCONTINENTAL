import type { paginatedResponseI } from '../base/PaginationInterface'
import type { ProductBrandI } from './ProductBrandInterface'
import type { ProductCategoryI } from './ProductCategoryInterface'
import type { ProductSpecificationI } from './ProductSpecificationInterface'
import type { ProductSubcategoryI } from './ProductSubcategoryInterface'

export interface ProductI {
  id: number
  name: string
  model: string
  subcategory: string
  brand: string
  status: boolean
}

export interface ProductExtendI {
  id: number
  name: string
  model: string
  description?: string
  status: boolean
  category: ProductCategoryI
  subcategory: ProductSubcategoryI
  brand: ProductBrandI
  specifications: ProductSpecificationI[]
}

export type ProductsI = paginatedResponseI<ProductI>
