import type { paginatedResponseI } from '@/interfaces/admin/base/PaginationInterface'

export interface productSI {
  id: number
  name: string
  model: string
  brand: string
  variant: productVariantSI
}

export interface productVariantSI {
  id: number
  selling_price: number
  stock: number
  image: string
  imgLoaded?: boolean
}

export type productsSI = paginatedResponseI<productSI>
