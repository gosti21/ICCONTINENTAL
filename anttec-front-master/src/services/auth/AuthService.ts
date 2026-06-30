import type { loginDTO } from '@/DTOs/auth/LoginDTO'
import type { registerDTO } from '@/DTOs/auth/RegisterDTO'
import type { logoutI } from '@/interfaces/auth/LogoutInterface'
import type { registerI } from '@/interfaces/auth/RegisterInterface'
import { useAuthStore } from '@/stores/useAuthStore'
import { handleApiError } from '@/utils/handleApiError'
import type { AxiosInstance } from 'axios'
import axios from 'axios'
import type { loginI } from '../../interfaces/auth/LoginInterface'

const urlApi = import.meta.env.VITE_API_URL

class AuthService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: `${urlApi}/auth`,
    })
  }

  async login(data: loginDTO): Promise<loginI> {
    try {
      const res = await this.api.post<loginI>('/login', data, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      const token = res.data.token

      const authStore = useAuthStore()
      authStore.setToken(token)
      authStore.setUser(res.data.user)

      return res.data
    } catch (error) {
      handleApiError(error)
    }
  }

  async register(data: registerDTO): Promise<registerI> {
    const res = await this.api.post<registerI>('/register', data, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    const token = res.data.token
    const authStore = useAuthStore()
    authStore.setToken(token)
    authStore.setUser(res.data.user)
    return res.data
  }

  async logout(): Promise<logoutI> {
    const authStore = useAuthStore()
    try {
      const res = await this.api.post<logoutI>(
        '/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      )
      authStore.clear()
      console.log(res.data.message)
      return res.data
    } catch (error) {
      handleApiError(error)
    }
  }
}

export default AuthService
