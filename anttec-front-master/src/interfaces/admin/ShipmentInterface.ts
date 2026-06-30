import type { paginatedResponseI } from './base/PaginationInterface'

export interface shipmentI {
  id: number | string
  order_number: number | string
  tracking_number: string
  shippingCompany: string
  delivery_type: string
  shipment_cost: string | number
  status: string
  status_en: string
  dispatched_at: string | Date
  delivered_at: string | Date
}

export type shipmentsI = paginatedResponseI<shipmentI>
