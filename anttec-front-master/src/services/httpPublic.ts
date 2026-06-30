import { useAuthStore } from '@/stores/useAuthStore'
import { handleHttpError } from '@/utils/errorHandler'
import axios from 'axios'

const httpPublic = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Interceptor de REQUEST
httpPublic.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    // 1. Si el usuario está autenticado, agregar el token
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

httpPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    // Endpoints públicos - el 401 es esperado si no estás logueado
    handleHttpError(error, {
      isPublicEndpoint: true,
      redirect404: false, // No redirigir automáticamente en 404
      silent: error.response?.status === 401, // No loguear 401 en endpoints públicos
    })

    return Promise.reject(error)
  },
)

export default httpPublic
