import { useAuthStore } from '@/stores/useAuthStore'
import { handleHttpError } from '@/utils/errorHandler'
import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT_MS } from './apiConfig'

const httpStrict = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
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
