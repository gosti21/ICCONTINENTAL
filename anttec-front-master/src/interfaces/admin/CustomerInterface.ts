import type { paginatedResponseI } from './base/PaginationInterface'

export interface customerI {
  id: number
  type_customer: string
  type_customer_en: string
  name?: string
  last_name?: string
  business_name?: string
  tax_address?: string
  type_document: string
  document_number: string
}

export type customersI = paginatedResponseI<customerI>
