import type { paginatedResponseI } from '../base/PaginationInterface'
import type { OptionValueI } from './OptionValueInterface'

export interface OptionI {
  id: number
  name: string
  type: string
  status: boolean
}

export interface OptionExtendI {
  id: number
  name: string
  type: string
  status: boolean
  option_values: OptionValueI[]
}

export type OptionsI = paginatedResponseI<OptionI>
