export interface variantEditDTO {
  selling_price: string | number
  purcharse_price: string | number
  stock_min: string | number
  images?: { image: File | Blob }[]
}
