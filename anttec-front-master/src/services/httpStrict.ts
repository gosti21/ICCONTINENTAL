import { useAuthStore } from '@/stores/useAuthStore'
import { handleHttpError } from '@/utils/errorHandler'
import axios from 'axios'

const httpStrict = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ============================================
// REQUEST INTERCEPTOR
// ============================================
httpStrict.interceptors.request.use(
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

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
httpStrict.interceptors.response.use(
  (response) => response,
  (error) => {
    // Similar a httpAdmin pero CON redirect404: true
    handleHttpError(error, {
      isPublicEndpoint: false,
      redirect404: true, // ← Redirige automáticamente en 404
    })

    return Promise.reject(error)
  },
)

export default httpStrict
