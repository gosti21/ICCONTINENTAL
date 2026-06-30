import type { userI } from '@/interfaces/auth/UserInterface'
import AuthService from '@/services/auth/AuthService'
import { defineStore } from 'pinia'
import { useCartStore } from './useCartStore'

const authService = new AuthService()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') || null,
    user: localStorage.getItem('user')
      ? (JSON.parse(localStorage.getItem('user') as string) as userI)
      : null,
  }),

  getters: {
    // ← AÑADIR ESTOS GETTERS
    userRoles: (state) => state.user?.roles || [],
    isAdmin: (state) => state.user?.roles?.includes('admin') || false,
    isEmployee: (state) => state.user?.roles?.includes('employee') || false,
    isUser: (state) => state.user?.roles?.includes('user') || false,
  },

  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('access_token', token)
    },

    setUser(user: userI) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    async setAuthData(token: string, user: userI) {
      this.setToken(token)
      this.setUser(user)

      // Sincronizar carrito solo si hay items que sincronizar
      const cartStore = useCartStore()

      // Solo intentar sincronizar si hay un sessionId válido Y items en el carrito
      if (cartStore.sessionId && cartStore.hasItems) {
        try {
          await cartStore.mergeCart()
          console.log('Carrito sincronizado exitosamente')
        } catch (error) {
          console.error('Error al sincronizar carrito después del login:', error)
          // No lanzamos el error para no bloquear el login
        }
      } else {
        console.log('No hay items en el carrito para sincronizar')
      }
    },

    // Método mejorado para logout con limpieza de carrito
    async logout() {
      await authService.logout()
      // Limpiar datos de autenticación
      this.clear()

      // Limpiar carrito y reiniciar sessionId
      const cartStore = useCartStore()
      await cartStore.clearOnLogout()
    },

    clear() {
      this.token = null
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    },

    isAuthenticated(): boolean {
      return !!this.token
    },

    hasRole(role: string | string[]): boolean {
      if (!this.user?.roles) return false
      const roles = Array.isArray(role) ? role : [role]
      return roles.some((r) => this.user!.roles.includes(r))
    },
  },
})
