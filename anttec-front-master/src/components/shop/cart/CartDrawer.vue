<script setup lang="ts">
import cartEmpty from '@/assets/img/carro-vacio.png'
import { useCart } from '@/composables/useCart'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import CartItemMini from './CartItemMini.vue'

const router = useRouter()
const { items, totals, isEmpty, isDrawerOpen, closeDrawer } = useCart()

// Cerrar con tecla Escape
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isDrawerOpen) {
    closeDrawer()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

// Ir al carrito completo
const goToCart = () => {
  closeDrawer()
  router.push({ name: 'shop.cart' })
}

// Ir al checkout
const goToCheckout = () => {
  closeDrawer()
  router.push({ name: 'shop.checkout.delivery' })
}

watch(isDrawerOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div
      v-if="isDrawerOpen"
      @click="closeDrawer"
      class="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
    ></div>
  </Transition>

  <!-- Drawer -->
  <Transition name="slide">
    <div
      v-if="isDrawerOpen"
      class="fixed top-0 right-0 h-full w-full sm:w-100 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800"
      >
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <font-awesome-icon icon="fa-solid fa-shopping-cart" class="text-gray-2 00" />
          Carrito
          <span v-if="!isEmpty" class="text-sm font-normal text-gray-400"
            >({{ totals.items_count }})</span
          >
        </h2>
        <button
          @click="closeDrawer"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Cerrar carrito"
        >
          <font-awesome-icon icon="fa-solid fa-times" class="text-xl" />
        </button>
      </div>

      <!-- Contenido -->
      <div class="flex-1 overflow-y-auto">
        <!-- Estado vacío -->
        <div
          v-if="isEmpty"
          class="flex flex-col items-center justify-center h-full p-8 text-center"
        >
          <img :src="cartEmpty" alt="carrito-vacio" class="h-32 mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Tu carrito está vacío
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Agrega productos para comenzar tu compra
          </p>
          <button
            @click="closeDrawer"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer"
          >
            Explorar productos
          </button>
        </div>

        <!-- Lista de items -->
        <div v-else class="p-4 space-y-3">
          <CartItemMini v-for="item in items" :key="item.item_id" :item="item" />
        </div>
      </div>

      <!-- Footer -->
      <div v-if="!isEmpty" class="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4">
        <!-- Totales -->
        <div class="space-y-2">
          <div
            class="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-200 pt-2 border-t border-gray-200 dark:border-gray-700"
          >
            <span>Total:</span>
            <span class="text-gray-700 dark:text-gray-100">S/ {{ totals.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="space-y-2">
          <button
            @click="goToCheckout"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg hover:shadow-xl cursor-pointer"
          >
            Finalizar compra
          </button>
          <button
            @click="goToCart"
            class="w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Ver carrito completo
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Animación del overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animación del drawer */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Scrollbar personalizado */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgb(156 163 175);
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgb(75 85 99);
}
</style>
