import type { paginatedResponseI } from "../base/PaginationInterface"

export interface employeeShortI {
  id: number
  user: employeesUserI
  phone: employeesPhoneI
  document: employeesDocumentI
  status: boolean
  rol: string
  rol_en: string
}

export interface employeesUserI {
  name: string
  last_name: string
}

export interface employeesPhoneI {
  number: string | number
}

export interface employeesDocumentI {
  type: string
  number: number | string
}

export type employeesShortI = paginatedResponseI<employeeShortI>
