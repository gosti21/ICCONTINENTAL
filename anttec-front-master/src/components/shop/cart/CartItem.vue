<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import noImg from '@/assets/img/no-image.jpg'
import { useCart } from '@/composables/useCart'
import type { detailCartSI } from '@/interfaces/shop/Cart/DetailCartSInterface'

interface Props {
  item: detailCartSI
}

const props = defineProps<Props>()
const router = useRouter()
const { updateQuantity, removeItem } = useCart()

// Estado de carga de la imagen
const imageLoaded = ref(false)
const isUpdating = ref(false)

const mainImage = computed(() => {
  return props.item.variant.image || noImg
})

const itemSubtotal = computed(() => {
  return (Number(props.item.unit_price) * props.item.quantity).toFixed(2)
})

const handleImageLoad = () => {
  imageLoaded.value = true
}

const handleImageError = () => {
  imageLoaded.value = true
}

const handleRemove = async () => {
  isUpdating.value = true
  try {
    await removeItem(props.item.branch_variant_id)
  } finally {
    isUpdating.value = false
  }
}

const increment = async () => {
  if (props.item.quantity < props.item.variant.stock) {
    isUpdating.value = true
    try {
      await updateQuantity(props.item.branch_variant_id, props.item.quantity + 1)
    } finally {
      isUpdating.value = false
    }
  }
}

const decrement = async () => {
  isUpdating.value = true
  try {
    await updateQuantity(props.item.branch_variant_id, props.item.quantity - 1)
  } finally {
    isUpdating.value = false
  }
}

const goToProduct = () => {
  router.push({
    name: 'shop.variant.show',
    params: {
      productId: props.item.variant.product_id,
      variantId: props.item.variant.id,
    },
  })
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 lg:p-5 transition-all hover:shadow-lg relative"
    :class="{ 'opacity-60 pointer-events-none': isUpdating }"
  >
    <!-- Overlay de actualización -->
    <div
      v-if="isUpdating"
      class="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center z-10"
    >
      <div class="flex flex-col items-center gap-2">
        <div
          class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">Actualizando...</span>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 sm:items-center">
      <!-- Imagen con Skeleton -->
      <div
        @click="!isUpdating && goToProduct()"
        class="w-full sm:w-40 h-40 shrink-0 rounded-lg overflow-hidden relative transition-opacity"
        :class="{ 'cursor-pointer hover:opacity-80': !isUpdating, 'cursor-default': isUpdating }"
      >
        <!-- Skeleton -->
        <div
          v-if="!imageLoaded"
          role="status"
          class="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-700 animate-pulse"
        >
          <img :src="noImg" alt="Cargando imagen" class="w-16 h-16 object-contain opacity-60" />
          <span class="sr-only">Cargando...</span>
        </div>

        <!-- Imagen real -->
        <img
          :src="mainImage"
          :alt="item.variant.name"
          class="w-full h-full object-cover bg-gray-100 dark:bg-gray-900"
          :class="{ 'opacity-0': !imageLoaded }"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </div>

      <!-- Información -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start gap-4 mb-3">
          <div class="flex-1 min-w-0">
            <!-- Marca -->
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {{ item.variant.brand }}
            </p>

            <!-- Nombre -->
            <h3
              @click="!isUpdating && goToProduct()"
              class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors"
              :class="{
                'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400': !isUpdating,
                'cursor-default': isUpdating,
              }"
            >
              {{ item.variant.name }} - {{ item.variant.model }}
            </h3>

            <!-- Features -->
            <div v-if="item.variant.features.length > 0" class="flex flex-wrap gap-1.5 mb-3">
              <span
                v-for="feature in item.variant.features"
                :key="feature.id"
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-gray-600 text-blue-700 dark:text-gray-200 rounded text-xs font-medium"
              >
                <span class="font-semibold">{{ feature.option }}:</span>
                <span>{{ feature.description }}</span>
              </span>
            </div>

            <!-- SKU -->
            <div class="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500">
              <span>SKU: {{ item.variant.sku }}</span>
            </div>
          </div>

          <!-- Botón eliminar (Desktop) -->
          <button
            @click="handleRemove"
            :disabled="isUpdating"
            class="hidden sm:block text-gray-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 transition-colors p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Eliminar del carrito"
          >
            <font-awesome-icon icon="fa-solid fa-trash-alt" size="lg" />
          </button>
        </div>

        <!-- Precio y controles -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
          <!-- Precio unitario -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Precio:</span>
            <span class="text-lg font-bold text-gray-900 dark:text-gray-300">
              S/ {{ item.unit_price }}
            </span>
          </div>

          <!-- Controles de cantidad -->
          <div class="flex items-center gap-4">
            <div
              class="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
            >
              <button
                @click="decrement"
                class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <font-awesome-icon
                  icon="fa-solid fa-minus"
                  size="sm"
                  class="text-gray-600 dark:text-gray-200"
                />
              </button>

              <span
                class="px-4 py-2 font-semibold text-gray-900 dark:text-gray-100 min-w-12 text-center"
              >
                {{ item.quantity }}
              </span>

              <button
                @click="increment"
                :disabled="isUpdating || item.quantity >= item.variant.stock"
                class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <font-awesome-icon
                  icon="fa-solid fa-plus"
                  size="sm"
                  class="text-gray-600 dark:text-gray-200"
                />
              </button>
            </div>

            <!-- Stock disponible -->
            <span class="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
              Stock: {{ item.variant.stock }}
            </span>
          </div>

          <!-- Subtotal -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span class="text-xl font-bold text-blue-600 dark:text-gray-200">
              S/ {{ itemSubtotal }}
            </span>
          </div>
        </div>

        <!-- Stock bajo warning -->
        <div v-if="item.variant.stock < 5 && item.variant.stock > 0" class="mt-3">
          <p class="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="text-xs" />
            Solo quedan {{ item.variant.stock }} unidades disponibles
          </p>
        </div>

        <!-- Botón eliminar (Mobile) -->
        <button
          @click="handleRemove"
          :disabled="isUpdating"
          class="sm:hidden w-full mt-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 px-4 rounded-lg font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <font-awesome-icon icon="fa-solid fa-trash-alt" class="mr-2" />
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
