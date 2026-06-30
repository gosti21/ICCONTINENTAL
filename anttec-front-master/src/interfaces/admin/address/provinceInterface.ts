import type { paginatedResponseI } from '../base/PaginationInterface'
import type { generalI } from './generalnterface'

export interface provinceI {
  id: number
  name: string
  country: generalI
  department: generalI
  status: boolean
}

export type provincesI = paginatedResponseI<provinceI>
