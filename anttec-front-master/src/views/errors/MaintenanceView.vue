<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const countdown = ref(300) // 5 minutos en segundos
let interval: number

onMounted(() => {
  interval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const reloadPage = () => {
  window.location.reload()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full text-center">
      <!-- Icono animado -->
      <div class="mb-8">
        <div
          class="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      </div>

      <!-- Texto -->
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">503</h1>
      <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Estamos en Mantenimiento
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Estamos mejorando nuestra plataforma. Volveremos pronto.
      </p>

      <!-- Countdown -->
      <div class="mb-8">
        <div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
          {{ formatTime(countdown) }}
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Tiempo estimado</p>
      </div>

      <!-- Botón -->
      <button
        @click="reloadPage"
        class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        Verificar Estado
      </button>
    </div>
  </div>
</template>
