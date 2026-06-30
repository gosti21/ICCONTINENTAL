import type { cartTotalSI } from './CartSInterface'

export interface detailCartSI {
  item_id: number
  branch_variant_id: number
  quantity: number
  unit_price: number
  variant: detailCartVariantSI
}

export interface detailCartVariantSI {
  id: number
  sku: string
  product_id: number
  name: string
  model: string
  brand: string
  stock: number
  image: string
  imgLoaded?: boolean
  features: detailCartVariantFeatureSI[]
}

export interface detailCartVariantFeatureSI {
  id: number
  option: string
  type: string
  value: string
  description: string
}

export interface addItemResponseSI {
  item: detailCartSI
  totals: cartTotalSI
}

export interface updateItemResponseSI {
  item: detailCartSI | null
  totals: cartTotalSI
}

export interface removeItemResponseI {
  totals: cartTotalSI
}
