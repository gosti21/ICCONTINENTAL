export interface districtUpdateDTO {
  name?: string
  province_id?: string | number
  delivery_price?: number | string
  min_delivery_days?: number
  max_delivery_days?: number
  status?: boolean
}
