export interface branchSI {
  id: number
  name: string
  address: branchAddressSI
  delivery_price: number
}

export interface branchAddressSI {
  id: number
  street: string
  reference: string
  district: string
}
