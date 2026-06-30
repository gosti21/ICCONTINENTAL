export interface employeeI {
  id: number
  salary: number
  position: string
  posicion: string
  user: employeesUserI
  phone: employeesPhoneI
  document: employeesDocumentI
  status: boolean
  rol: string
}

export interface employeesUserI {
  name: string
  last_name: string
  email: string
}

export interface employeesPhoneI {
  prefix: string | number
  number: string | number
}

export interface employeesDocumentI {
  type: string
  number: number | string
}
