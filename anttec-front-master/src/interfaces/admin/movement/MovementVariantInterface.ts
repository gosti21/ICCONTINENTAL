export interface movementVariantI {
  id: number | string
  name: string
  model: string
  quantity: string | number
  features: movementVariantFeatureI[]
}

export interface movementVariantFeatureI {
  id: number | string
  description: string
}
