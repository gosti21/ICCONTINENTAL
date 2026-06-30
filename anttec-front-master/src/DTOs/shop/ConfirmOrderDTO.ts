export interface confirmOrderDTO {
  type_voucher: 'boleta' | 'factura'
  delivery_type: string | undefined
  document_type: string | undefined
  document_number: number | undefined | string
  customer: customerOrder | undefined
  receiver_info: receiverInfoOrder | undefined
  address_id: number
}

export interface customerOrder {
  name?: string
  last_name?: string
  business_name?: string
  tax_address?: string
}

export interface receiverInfoOrder {
  name?: string
  last_name?: string
  phone?: string
  document_type?: string
  document_number?: string
}
