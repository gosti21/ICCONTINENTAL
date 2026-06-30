<script setup lang="ts">
import noImg from '@/assets/img/no-image.jpg'
import { useCart } from '@/composables/useCart'
import type { detailCartSI } from '@/interfaces/shop/Cart/DetailCartSInterface'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  item: detailCartSI
}

const props = defineProps<Props>()
const router = useRouter()
const { updateQuantity, removeItem, closeDrawer } = useCart()

const isLoading = ref(false)
const imageLoaded = ref(props.item.variant.imgLoaded ?? false)

const mainImage = computed(() => {
  return props.item.variant.image || noImg
})

const featuresText = computed(() => {
  return props.item.variant.features.map((f) => f.description).join(' | ')
})

const itemTotal = computed(() => {
  return (Number(props.item.unit_price) * props.item.quantity).toFixed(2)
})

const handleImageLoad = () => {
  imageLoaded.value = true
}

const handleImageError = () => {
  imageLoaded.value = true
}

const handleRemove = async () => {
  isLoading.value = true
  try {
    await removeItem(props.item.branch_variant_id)
  } finally {
    isLoading.value = false
  }
}

const increment = async () => {
  if (props.item.quantity < props.item.variant.stock) {
    isLoading.value = true
    try {
      await updateQuantity(props.item.branch_variant_id, props.item.quantity + 1)
    } finally {
      isLoading.value = false
    }
  }
}

const decrement = async () => {
  if (props.item.quantity >= 1) {
    isLoading.value = true
    try {
      await updateQuantity(props.item.branch_variant_id, props.item.quantity - 1)
    } finally {
      isLoading.value = false
    }
  }
}

const goToProduct = () => {
  closeDrawer()
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
    class="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-all relative"
    :class="{ 'opacity-60 pointer-events-none': isLoading }"
  >
    <!-- Overlay de carga -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center z-10"
    >
      <div class="flex flex-col items-center gap-2">
        <div
          class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">Actualizando...</span>
      </div>
    </div>

    <!-- Imagen con Skeleton -->
    <div
      @click="!isLoading && goToProduct()"
      class="w-20 h-20 shrink-0 rounded-lg overflow-hidden transition-opacity relative"
      :class="{ 'cursor-pointer hover:opacity-80': !isLoading, 'cursor-default': isLoading }"
    >
      <!-- Skeleton -->
      <div
        v-if="!imageLoaded"
        role="status"
        class="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-700 animate-pulse"
      >
        <img :src="noImg" alt="Cargando imagen" class="w-10 h-10 object-contain opacity-60" />
        <span class="sr-only">Cargando...</span>
      </div>

      <!-- Imagen real -->
      <img
        :src="mainImage"
        :alt="item.variant.name"
        class="w-full h-full object-cover bg-white dark:bg-gray-900"
        :class="{ 'opacity-0': !imageLoaded }"
        @load="handleImageLoad"
        @error="handleImageError"
      />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h4
        @click="goToProduct"
        class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
      >
        {{ item.variant.name }}
      </h4>

      <p v-if="featuresText" class="text-xs text-gray-500 dark:text-gray-300 mb-2 truncate">
        {{ featuresText }}
      </p>

      <!-- Precio y controles -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button
            @click="decrement"
            class="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Disminuir cantidad"
          >
            <font-awesome-icon icon="fa-solid fa-minus" class="text-xs" />
          </button>

          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100 min-w-6 text-center">
            {{ item.quantity }}
          </span>

          <button
            @click="increment"
            :disabled="item.quantity >= item.variant.stock"
            class="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Aumentar cantidad"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="text-xs" />
          </button>
        </div>

        <div class="text-right">
          <p class="text-sm font-bold text-gray-600 dark:text-gray-300">S/ {{ itemTotal }}</p>
        </div>
      </div>
    </div>

    <!-- Botón eliminar -->
    <button
      @click="handleRemove"
      class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors self-start cursor-pointer"
      title="Eliminar"
    >
      <font-awesome-icon icon="fa-solid fa-trash-alt" class="text-sm" />
    </button>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animación del spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
