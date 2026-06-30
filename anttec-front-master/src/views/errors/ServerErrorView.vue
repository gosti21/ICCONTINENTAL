<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const goHome = () => {
  router.push({ name: 'shop.home' })
}

const reloadPage = () => {
  const originalRoute = (route.query.from as string) || '/'

  // Verificación de seguridad
  if (originalRoute && originalRoute !== '/server-error') {
    router.push(originalRoute)
  } else {
    router.push({ name: 'shop.home' })
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full text-center">
      <!-- Icono -->
      <div class="mb-8">
        <div
          class="mx-auto w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-yellow-600 dark:text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      <!-- Texto -->
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">500</h1>
      <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Error del Servidor
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Algo salió mal en nuestros servidores. Estamos trabajando para solucionarlo.
      </p>

      <!-- Botones -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="reloadPage"
          class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium cursor-pointer"
        >
          Reintentar
        </button>
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
