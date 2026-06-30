import type { paginatedResponseI } from '../base/PaginationInterface'

export interface countryI {
  id: number
  name: string
  iso_code: string
  status: boolean
}

export type countriesI = paginatedResponseI<countryI>
