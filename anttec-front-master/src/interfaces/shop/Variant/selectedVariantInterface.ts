export interface selectedVariantSI {
  id: number
  branch_variant_id: number
  sku: string
  price: string | number
  stock: number
  images: imgSI[]
  features: featuresSI[]
}

export interface imgSI {
  url: string
  imgLoaded?: boolean
}

export interface featuresSI {
  id: number
  option: string
  type: string
  value: string
  description: string
}
