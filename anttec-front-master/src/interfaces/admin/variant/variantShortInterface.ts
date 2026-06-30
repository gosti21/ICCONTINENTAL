import type { paginatedResponseI } from '../base/PaginationInterface'
import type { variantFeatureI } from './variantFeatureInterface'
import type { imgI } from './variantImgInterface'

export interface variantShortI {
  id: number | string
  sku: string
  status: boolean
  img: imgI[]
  features: variantFeatureI[]
  // propiedad para skeleton
  imgLoaded?: boolean
}

export type variantShortsI = paginatedResponseI<variantShortI>
