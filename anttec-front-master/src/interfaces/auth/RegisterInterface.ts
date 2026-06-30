import type { userI } from './UserInterface'

export interface registerI {
  success: boolean
  message: string
  token: string
  user: userI
}
