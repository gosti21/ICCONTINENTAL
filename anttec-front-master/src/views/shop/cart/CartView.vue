<script setup lang="ts">
import cartEmpty from '@/assets/img/carro-vacio.png'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CartItem from '@/components/shop/cart/CartItem.vue'
import { useCart } from '@/composables/useCart'

const router = useRouter()
const { items, totals, isEmpty, isLoading, loadCart, clearCart } = useCart()

onMounted(async () => {
  await loadCart()
})

const handleClearCart = async () => {
  await clearCart()
}

const continueShopping = () => {
  router.push({ name: 'shop.home' })
}

const proceedToCheckout = () => {
  router.push({ name: 'shop.checkout.delivery' })
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 lg:py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Carrito de Compras
      </h1>
      <p v-if="!isEmpty && !isLoading" class="text-gray-600 dark:text-gray-400">
        {{ totals.items_count }} {{ totals.items_count === 1 ? 'producto' : 'productos' }} en tu
        carrito
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl h-48"
      ></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="flex flex-col items-center justify-center py-10 px-4">
      <div class="text-center max-w-md">
        <!-- Icono -->
        <div class="mb-8">
          <div class="flex items-center justify-center">
            <img :src="cartEmpty" alt="carrito-vacio" class="h-32" />
          </div>
        </div>

        <!-- Título -->
        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Tu carrito está vacío
        </h2>

        <!-- Descripción -->
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          Parece que aún no has agregado ningún producto. ¡Explora nuestra tienda y encuentra lo que
          necesitas!
        </p>

        <!-- Botón CTA -->
        <button
          @click="continueShopping"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <span class="flex items-center justify-center gap-2 cursor-pointer">
            Ir a la tienda
          </span>
        </button>
      </div>
    </div>

    <!-- Cart Content -->
    <div v-else class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Items List -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Botón vaciar carrito -->
        <div class="flex justify-end mb-4">
          <button
            @click="handleClearCart"
            class="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800/20 py-2 px-4 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-trash-alt" class="mr-2" />
            Vaciar carrito
          </button>
        </div>

        <!-- Lista de items -->
        <CartItem v-for="item in items" :key="item.item_id" :item="item" />
      </div>

      <!-- Resumen del pedido -->
      <div class="lg:col-span-1">
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-4"
        >
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-300 mb-6">
            Resumen del pedido
          </h2>

          <!-- Desglose -->
          <div class="space-y-4 mb-6">
            <div
              class="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-300 pt-4 border-t border-gray-300 dark:border-gray-700"
            >
              <span>Total:</span>
              <span class="text-2xl text-blue-600 dark:text-gray-100"
                >S/ {{ totals.total.toFixed(2) }}</span
              >
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="space-y-3">
            <button
              @click="proceedToCheckout"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span class="flex items-center justify-center gap-2"> Continuar compra </span>
            </button>

            <button
              @click="continueShopping"
              class="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-bold py-3 px-6 rounded-lg transition-colors cursor-pointer"
            >
              <span class="flex items-center justify-center gap-2"> Seguir comprando </span>
            </button>
          </div>

          <!-- Información adicional -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div
              class="flex gap-3 text-sm text-gray-600 dark:text-gray-400 items-center justify-center"
            >
              <font-awesome-icon icon="fa-solid fa-shield" class="text-green-600 mt-0.5" />
              <p>Compra 100% segura. Tus datos están protegidos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
