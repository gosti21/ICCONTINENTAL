  <script setup lang="ts">
import { useChatStore } from '@/stores/useChatStore'

const chatStore = useChatStore()

function handleClick() {
  chatStore.openChat()
  chatStore.initChat()
}
</script>

<template>
  <!-- Botón flotante -->
  <button
    @click="handleClick"
    class="fixed bottom-6 right-6 z-50 group"
    :class="{ 'scale-0': chatStore.isOpen }"
    aria-label="Abrir chat con IA"
  >
    <!-- Botón principal -->
    <div
      class="relative w-16 h-16 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-6 flex items-center justify-center cursor-pointer"
    >
      <!-- Icono -->
      <font-awesome-icon icon="fa-brands fa-bilibili" size="2xl" class="text-white text-2xl" />

      <!-- Efecto de pulso -->
      <span
        class="absolute inset-0 rounded-full bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 animate-ping opacity-20"
      ></span>
    </div>

    <!-- Tooltip -->
    <div
      class="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none"
    >
      ¿Necesitas ayuda? Pregúntame
      <div
        class="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"
      ></div>
    </div>
  </button>
</template>

<style scoped>
@keyframes ping {
  75%,
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
