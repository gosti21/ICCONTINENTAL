export interface OptionProductShortI {
  id: number
  product_id: string
  option_id: string
  values: OptionProductValueShortI[]
}

export interface OptionProductValueShortI {
  option_value_id: number
}
