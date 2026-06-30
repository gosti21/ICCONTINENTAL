import type { userI } from './UserInterface'

export interface loginI {
  success: boolean
  message: string
  token: string
  user: userI
}
