import axios from 'axios'

export function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      console.error('❌ Error de red o configuración de Axios:', error.message)
    } else if (error.response?.status === 422) {
      console.error('❌ Error de validación:', error.response.data)
    } else {
      console.error(`❌ Error en API [${error.response.status}]:`, error.response.data)
    }
  } else {
    console.error('❌ Error:', error)
  }

  throw error
}
