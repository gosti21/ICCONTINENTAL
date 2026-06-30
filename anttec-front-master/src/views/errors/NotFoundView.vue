<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const goHome = () => {
  if (authStore.isAuthenticated()) {
    if (authStore.isAdmin) {
      router.push({ name: 'admin.dashboard' })
    } else {
      router.push({ name: 'shop.home' })
    }
  } else {
    router.push({ name: 'shop.home' })
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full text-center">
      <!-- Icono animado -->
      <div class="mb-8">
        <div class="mx-auto w-32 h-32 relative">
          <div
            class="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/20 rounded-full animate-pulse"
          ></div>
          <div
            class="absolute inset-0 flex items-center justify-center text-6xl font-bold text-indigo-600 dark:text-indigo-400"
          >
            404
          </div>
        </div>
      </div>

      <!-- Texto -->
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Página no encontrada</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>

      <!-- Ilustración opcional (emoji) -->
      <div class="text-6xl mb-8">🔍</div>

      <!-- Botones -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="goHome"
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer"
        >
          Ir al Inicio
        </button>
      </div>
    </div>
  </div>
</template>
