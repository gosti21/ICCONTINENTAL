import type { generalI } from '../admin/address/generalnterface'

export interface addressExtendSI {
  id: number
  favorite: boolean
  street: string
  street_number: number | string
  reference: string
  district: generalI
  province: generalI
  department: generalI
  delivery_price: number
}
