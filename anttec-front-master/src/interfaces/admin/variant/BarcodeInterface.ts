export interface BarcodeItemI {
  variant_id: number | string
  quantity: number
  variant_name?: string
  sku?: string
  features?: string
}

export interface BarcodeGeneratePayload {
  items: BarcodeItemI[]
}
