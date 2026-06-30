import type { variantFeatureI } from './variant/variantFeatureInterface'

export interface branchVariantI {
  id: number | string
  sku: string
  status: boolean
  product: variantProductI
  features: variantFeatureI[]
}

export interface variantProductI {
  id?: number | string
  name: string
  model: string
}
