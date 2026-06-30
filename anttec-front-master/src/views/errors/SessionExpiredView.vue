<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const goToLogin = () => {
  authStore.clear()
  router.push({ name: 'login' })
}

const goHome = () => {
  router.push({ name: 'shop.home' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full text-center">
      <!-- Icono -->
      <div class="mb-8">
        <div
          class="mx-auto w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-orange-600 dark:text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      </div>

      <!-- Texto -->
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Sesión Expirada</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.
      </p>

      <!-- Botones -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="goHome"
          class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium cursor-pointer"
        >
          Ir al Inicio
        </button>
        <button
          @click="goToLogin"
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer"
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  </div>
</template>
