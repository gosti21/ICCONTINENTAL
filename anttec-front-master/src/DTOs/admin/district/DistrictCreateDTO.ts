export interface districtCreateDTO {
  name: string
  province_id: string | number
  delivery_price: string | number
  min_delivery_days: number
  max_delivery_days: number
}
