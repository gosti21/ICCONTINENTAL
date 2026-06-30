import { useAuthStore } from '@/stores/useAuthStore'
import { createRouter, createWebHistory } from 'vue-router'
import adminRoutes from './adminRoutes'
import publicRoutes from './publicRoutes'

const routes = [
  ...publicRoutes,
  ...adminRoutes,
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/views/errors/UnauthorizedView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/session-expired',
    name: 'session-expired',
    component: () => import('@/views/errors/SessionExpiredView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/server-error',
    name: 'server-error',
    component: () => import('@/views/errors/ServerErrorView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: () => import('@/views/errors/MaintenanceView.vue'),
    meta: { requiresAuth: false },
  },
  // ✅ Catch-all 404 - DEBE IR AL FINAL
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/errors/NotFoundView.vue'),
    meta: { requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Si hay posición guardada (volver atrás con el botón de navegador)
    if (savedPosition) {
      return savedPosition
    }
    // Si hay un hash (ej. #terminos)
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth', // scroll suave
      }
    }
    // Por defecto, ir al top
    return { top: 0 }
  },
})

let lastValidRoute = '/'

// Lista de rutas de error (para no guardarlas como "última válida")
const ERROR_ROUTE_NAMES = [
  'server-error',
  'unauthorized',
  'not-found',
  'session-expired',
  'maintenance',
]

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (!ERROR_ROUTE_NAMES.includes(to.name as string)) {
    lastValidRoute = to.fullPath
  }

  // 1. Validar autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  }

  // 2. Redirigir si ya está logueado e intenta ir a login
  if (to.name === 'login' && authStore.isAuthenticated()) {
    const redirectTo = to.query.redirect as string

    if (redirectTo && redirectTo !== '/login') {
      return next(redirectTo)
    }

    if (authStore.isAdmin) {
      return next({ name: 'admin.dashboard' })
    } else {
      return next({ name: 'shop.home' })
    }
  }

  // 3. Validar roles
  if (to.meta.roles) {
    const requiredRoles = Array.isArray(to.meta.roles) ? to.meta.roles : [to.meta.roles]
    const hasRequiredRole = requiredRoles.some((role) => authStore.hasRole(role))

    if (!hasRequiredRole) {
      return next({ name: 'unauthorized' })
    }
  }

  next()
})

router.onError((error) => {
  console.error('Router navigation error:', error)

  // Si el error es porque la ruta no existe, ir a 404
  // (esto captura errores de lazy loading o rutas mal formadas)
  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('error loading dynamically imported module')
  ) {
    router.push({ name: 'not-found' })
  } else {
    // Otros errores de navegación -> server error
    router.push({
      name: 'server-error',
      query: { from: lastValidRoute },
    })
  }
})

// ← EXPORTAR para usar en errorHandler
export { lastValidRoute }

export default router
