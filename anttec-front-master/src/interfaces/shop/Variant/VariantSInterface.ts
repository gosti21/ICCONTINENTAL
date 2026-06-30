import type { featuresSI, selectedVariantSI } from './selectedVariantInterface'
import type { variantSpecificationsSI } from './VariantSpecificationsInterface'

export interface variantSI {
  id: number
  name: string
  category: categorySI
  subcategory: subcategorySI
  model: string
  description: string | null
  brand: string
  specifications: variantSpecificationsSI[]
  selected_variant: selectedVariantSI
  variants: variantsSI[]
}

export interface variantsSI {
  id: number
  branch_variant_id: number
  features: featuresSI[]
}

export interface categorySI {
  id: number
  name: string
}

export interface subcategorySI {
  id: number
  name: string
}
