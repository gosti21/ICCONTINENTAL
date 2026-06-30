<script setup lang="ts">
import { useCart } from '@/composables/useCart'

const { itemsCount, toggleDrawer } = useCart()
</script>

<template>
  <button
    @click="toggleDrawer"
    class="relative p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 rounded-lg cursor-pointer transition-colors"
    aria-label="Carrito de compras"
  >
    <font-awesome-icon icon="fa-solid fa-cart-shopping" class="text-3xl text-gray-200" />
    <span
      class="absolute -top-1 -right-1 bg-gray-800 text-white font-medium rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
    >
      {{ itemsCount ? (itemsCount > 99 ? '99+' : itemsCount) : 0 }}
    </span>
  </button>
</template>

<style scoped>
@keyframes scale-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}
</style>
