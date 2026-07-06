const DEFAULT_API_URL = 'https://iccontinental-1.onrender.com/api/v1'

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() || DEFAULT_API_URL

export const API_TIMEOUT_MS = 30000
