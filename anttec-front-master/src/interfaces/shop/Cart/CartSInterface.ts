import type { detailCartSI } from './DetailCartSInterface'

export interface cartSI {
  id: number
  session_id: boolean
  status: string
  user_id: number
  detail_cart: detailCartSI[]
}

export interface cartTotalSI {
  total: number
  items_count: number
}

export interface cartResponseSI {
  cart: cartSI
  totals: cartTotalSI
}
