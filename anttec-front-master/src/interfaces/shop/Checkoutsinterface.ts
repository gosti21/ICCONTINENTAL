import type { ShippingMethodType } from './Shippingsinterface '

// Datos del cliente para el pedido
export interface CustomerDataSI {
  name: string
  last_name: string
  document_type: 'DNI' | 'CE'
  document_number: string
  phone: string
}

// Información de entrega
export interface DeliveryInfoSI {
  delivery_type: ShippingMethodType

  // Para delivery
  address_id?: number
  shipping_cost?: number

  // Para pickup
  branch_id?: number

  // Datos del cliente
  reciber: CustomerDataSI
}

// Estado completo del checkout
export interface CheckoutStateSI {
  // Paso 1: Entrega
  delivery?: DeliveryInfoSI

  // Paso 2: Facturación (para futuro)
  billing?: BillingInfoSI

  // Paso 3: Pago (para futuro)
  payment?: {
    method: string
    // Otros datos de pago
  }

  // Resumen
  summary?: CheckoutSummarySI
}

export interface BillingInfoSI {
  type_voucher: 'boleta' | 'factura'
  document_type?: 'DNI' | 'CE' | 'RUC'
  document_number?: string
  customer: customerBillingInfoSI
}

export interface customerBillingInfoSI {
  name?: string
  last_name?: string
  business_name?: string
  tax_address?: string
}

// Resumen del checkout
export interface CheckoutSummarySI {
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  items_count: number
}

// Validación de paso completado
export interface StepValidationSI {
  cart: boolean // Paso 1: Carrito tiene items
  delivery: boolean // Paso 2: Entrega completada
  payment: boolean // Paso 3: Pago completado
}
