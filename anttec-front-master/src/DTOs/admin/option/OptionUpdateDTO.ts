import type { OptionValuesDTO } from './OptionValuesDTO'

export interface optionUpdateDTO {
  name?: string
  status?: boolean
  option_values?: OptionValuesDTO[]
}
