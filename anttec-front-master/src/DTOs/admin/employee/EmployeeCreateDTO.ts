export interface employeeCreateDTO {
  name: string
  last_name: string
  email: string
  password: string
  position: string
  salary: string | number
  phone: string | number
  document_type: string
  document_number: string | number
}
