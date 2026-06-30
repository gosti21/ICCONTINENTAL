import router, { lastValidRoute } from '@/router'
import { useAuthStore } from '@/stores/useAuthStore'
import type { AxiosError } from 'axios'
import type { RouteLocationRaw } from 'vue-router'

interface ErrorHandlerOptions {
  isPublicEndpoint?: boolean
  redirect404?: boolean // Si debe redirigir en 404 de API
  silent?: boolean // No mostrar console.error
}

/**
 * Maneja errores HTTP de llamadas a la API
 * NO maneja errores de rutas (404 de navegación)
 */
export function handleHttpError(error: AxiosError, options: ErrorHandlerOptions = {}) {
  const {
    isPublicEndpoint = false,
    redirect404 = false, // ← CAMBIO: Por defecto NO redirige en 404 de API
    silent = false,
  } = options

  const status = error.response?.status
  const currentRoute = router.currentRoute.value

  // Evitar redirecciones si ya estamos en una página de error
  const errorPages = ['server-error', 'unauthorized', 'session-expired', 'maintenance', 'not-found']
  if (errorPages.includes(currentRoute.name as string)) {
    if (!silent) console.warn('Already on error page, skipping redirect')
    return
  }

  switch (status) {
    case 401: {
      // Si es endpoint público, solo loguear (es esperado)
      if (isPublicEndpoint) {
        if (!silent) console.info('401 on public endpoint (expected):', error.config?.url)
        return
      }

      // Endpoint protegido - sesión expirada
      const authStore = useAuthStore()
      if (authStore.isAuthenticated()) {
        authStore.clear()
        router.push({
          name: 'session-expired',
          query: { redirect: lastValidRoute },
        })
      } else {
        router.push({
          name: 'login',
          query: { redirect: currentRoute.fullPath },
        })
      }
      break
    }

    case 403:
      if (!silent) console.warn('403 Forbidden:', error.config?.url)
      router.push({ name: 'unauthorized' })
      break

    case 404:
      // 404 de API - el recurso no existe en el backend
      if (!silent) console.warn('404 API Resource not found:', error.config?.url)

      // Solo redirigir si está explícitamente habilitado
      if (redirect404) {
        router.push({ name: 'not-found' })
      }
      // En caso contrario, dejar que el componente maneje el error
      break

    case 500:
    case 502:
    case 503:
      if (!silent) console.error(`${status} Server error:`, error.config?.url)
      router.push({
        name: 'server-error',
        query: { from: lastValidRoute },
      })
      break

    default:
      if (!silent) console.error('Unhandled HTTP error:', status, error)
  }
}

/**
 * Verifica si una ruta existe en el router
 */
export function routeExists(routeName: string): boolean {
  return router.hasRoute(routeName)
}

/**
 * Navega de forma segura, redirigiendo a 404 si la ruta no existe
 */
export async function safeNavigate(to: RouteLocationRaw): Promise<void> {
  try {
    // Si es un objeto con name, verificar que exista
    if (typeof to === 'object' && 'name' in to && to.name && !routeExists(to.name as string)) {
      await router.push({ name: 'not-found' })
      return
    }

    await router.push(to)
  } catch (error) {
    console.error('Navigation error:', error)
    await router.push({ name: 'not-found' })
  }
}
