import type { OptionValuesDTO } from './OptionValuesDTO'

export interface optionCreateDTO {
  name: string
  type: string
  option_values: OptionValuesDTO[]
}
