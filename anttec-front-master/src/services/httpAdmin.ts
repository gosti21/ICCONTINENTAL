import { useAuthStore } from '@/stores/useAuthStore'
import { handleHttpError } from '@/utils/errorHandler'
import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT_MS } from './apiConfig'

const httpAdmin = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

httpAdmin.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

httpAdmin.interceptors.response.use(
  (response) => response,
  (error) => {
    // Endpoints de admin son siempre protegidos
    handleHttpError(error, {
      isPublicEndpoint: false,
      redirect404: false, // No redirigir automáticamente en 404
    })

    return Promise.reject(error)
  },
)

export default httpAdmin
