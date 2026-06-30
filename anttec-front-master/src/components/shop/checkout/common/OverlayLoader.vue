<script setup lang="ts">
interface Props {
  show: boolean
  message?: string
  variant?: 'primary' | 'success' | 'warning' | 'info'
  blur?: boolean
}

withDefaults(defineProps<Props>(), {
  message: 'Cargando...',
  variant: 'primary',
  blur: true
})

// Colores según variante
const variantClasses = {
  primary: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-indigo-600 dark:text-indigo-400'
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center"
      :class="blur ? 'backdrop-blur-sm' : ''"
    >
      <!-- Overlay con transparencia -->
      <div class="absolute inset-0 bg-black/40 dark:bg-black/60"></div>

      <!-- Contenedor del loader -->
      <div
        class="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full border border-gray-200 dark:border-gray-700"
      >
        <!-- Spinner animado -->
        <div class="flex flex-col items-center gap-4">
          <!-- Spinner principal -->
          <div class="relative">
            <!-- Círculo externo rotando -->
            <div
              class="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-transparent animate-spin"
              :class="variantClasses[variant]"
              style="border-top-color: currentColor"
            ></div>

            <!-- Círculo interno pulsante -->
            <div
              class="absolute inset-0 flex items-center justify-center"
            >
              <div
                class="w-12 h-12 rounded-full animate-pulse"
                :class="variantClasses[variant]"
                style="background: currentColor; opacity: 0.2"
              ></div>
            </div>

            <!-- Ícono central -->
            <div
              class="absolute inset-0 flex items-center justify-center"
            >
              <font-awesome-icon
                icon="fa-solid fa-credit-card"
                class="text-2xl animate-pulse"
                :class="variantClasses[variant]"
              />
            </div>
          </div>

          <!-- Mensaje -->
          <div class="text-center space-y-2">
            <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ message }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Por favor, espere un momento
            </p>
          </div>

          <!-- Puntos animados -->
          <div class="flex gap-2">
            <span
              v-for="i in 3"
              :key="i"
              class="w-2 h-2 rounded-full animate-bounce"
              :class="variantClasses[variant]"
              :style="{ animationDelay: `${i * 0.15}s`, background: 'currentColor' }"
            ></span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Animación personalizada para el bounce */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
