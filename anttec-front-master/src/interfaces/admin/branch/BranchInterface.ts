import type { paginatedResponseI } from '../base/PaginationInterface'
import type { AddressI } from './AddressInterface'
import type { phoneI } from './PhoneInterface'

export interface branchI {
  id: number
  name: string
  email: string
  status: boolean
  phone: phoneI
  address: AddressI
}

export type branchesI = paginatedResponseI<branchI>
