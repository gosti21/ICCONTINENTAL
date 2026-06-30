import type { paginatedResponseI } from '../base/PaginationInterface'
import type { generalI } from './generalnterface'

export interface departmentI {
  id: number
  name: string
  country: generalI
  status: boolean
}

export type departmentsI = paginatedResponseI<departmentI>
