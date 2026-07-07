const RENDER_PRIMARY_API_URL = 'https://iccontinental-1.onrender.com/api/v1'
const RENDER_SECONDARY_API_URL = 'https://iccontinental.onrender.com/api/v1'

const rawEnvApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
const isLocalEnvApiUrl =
  !!rawEnvApiUrl && /localhost|127\.0\.0\.1/i.test(rawEnvApiUrl)

export const API_BASE_URL =
  !rawEnvApiUrl || isLocalEnvApiUrl
    ? RENDER_PRIMARY_API_URL
    : rawEnvApiUrl

export const API_FALLBACK_BASE_URL = RENDER_SECONDARY_API_URL

export const API_TIMEOUT_MS = 30000
