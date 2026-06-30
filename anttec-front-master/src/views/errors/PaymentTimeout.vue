<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// Opcional: guardar la ruta previa si la tienes en localStorage o sessionStorage
const previousRoute = sessionStorage.getItem('checkoutRoute') || '/checkout'

const handleRetry = () => {
  // Regresar a la página de checkout
  router.push(previousRoute)
}

const handleGoHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <!-- Icono de reloj/timeout -->
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
          <font-awesome-icon
            icon="fa-solid fa-clock"
            class="text-orange-500 dark:text-orange-400 text-4xl"
          />
        </div>
      </div>

      <!-- Título -->
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white text-center mb-3">
        Tiempo de sesión agotado
      </h1>

      <!-- Descripción -->
      <p class="text-gray-600 dark:text-gray-300 text-center mb-8">
        El tiempo para completar tu pago ha expirado. Por favor, intenta nuevamente.
      </p>

      <!-- Botones de acción -->
      <div class="space-y-3">
        <!-- Botón principal: Reintentar -->
        <button
          @click="handleRetry"
          class="w-full px-6 py-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/30 dark:shadow-green-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Intentar nuevamente</span>
        </button>

        <!-- Botón secundario: Volver al inicio -->
        <button
          @click="handleGoHome"
          class="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <font-awesome-icon icon="fa-solid fa-house" />
          <span>Volver al inicio</span>
        </button>
      </div>
    </div>
  </div>
</template>
