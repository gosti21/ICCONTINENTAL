export interface shipmentUpdateDTO {
  status?:
    | 'ready_for_pickup'
    | 'dispatched'
    | 'in_transit'
    | 'delivered'
    | 'picked_up'
    | 'failed'
    | 'returned'
  tracking_number?: string
  shipping_company_id?: string | number
}
