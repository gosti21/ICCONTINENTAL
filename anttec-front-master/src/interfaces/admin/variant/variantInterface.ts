import type { paginatedResponseI } from '../base/PaginationInterface'
import type { variantFeatureI } from './variantFeatureInterface'
import type { imgI } from './variantImgInterface'

export interface variantI {
  id: number | string
  sku: string
  selling_price: number | string
  purcharse_price?: number | string
  product: variantProductI
  branch_stock: branchStockI
  status: boolean
  img: imgI[]
  features: variantFeatureI[]
  imgLoaded?: boolean
}

export interface variantProductI {
  id?: number | string
  name: string
  model: string
}

export interface branchStockI {
  stock_min: number
  stock: number
}

export type variantsI = paginatedResponseI<variantI>
