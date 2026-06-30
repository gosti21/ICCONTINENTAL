export interface chatRecommendI {
  type: string
  message: string
  products: productIAI[] | null
  conversation_id: string
  question_count: number
}

export interface productIAI {
  id: number
  name: string
  model: string
  description: string
  brand: string
  category: string
  subcategory: string
  specifications: Specification[]
  variants: Variant[]
  similarity_score: number
  match_score: number
  match_reason: string
}

export interface Specification {
  name: string
  value: string
}

export interface Variant {
  id: number
  sku: string
  price: number
  stock: number
  features: Feature[]
}

export interface Feature {
  option: string
  value: string
  type: string // si luego tienes tipos fijos, lo podemos convertir en union type
}
