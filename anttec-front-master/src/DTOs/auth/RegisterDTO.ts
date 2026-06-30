export interface registerDTO {
  name: string
  last_name: string
  email: string
  date_birth?: string | Date
  password: string
  password_confirmation: string
}
