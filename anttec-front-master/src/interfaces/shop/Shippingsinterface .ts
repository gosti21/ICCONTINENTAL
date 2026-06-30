// Tipos de método de envío
export type ShippingMethodType = 'shipment' | 'store_pickup'

// Interface para método de envío
export interface ShippingMethodSI {
  id: number
  type: ShippingMethodType
  name: string
  description?: string
  price: number // Precio base (0 para recojo en tienda)
  estimated_days?: number
  is_active: boolean
}
