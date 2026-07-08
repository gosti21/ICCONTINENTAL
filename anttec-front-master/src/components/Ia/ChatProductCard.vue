<script setup lang="ts">
import type { productIAI } from '@/interfaces/Ia/ChatRecommendInterface';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

interface Props {
  product: productIAI
}

const props = defineProps<Props>()
const router = useRouter()

// Precio mínimo de las variantes
const minPrice = computed(() => {
  if (!props.product.variants || props.product.variants.length === 0) return 0
  return Math.min(...props.product.variants.map((v) => v.price))
})

// Precio máximo de las variantes
const maxPrice = computed(() => {
  if (!props.product.variants || props.product.variants.length === 0) return 0
  return Math.max(...props.product.variants.map((v) => v.price))
})

const hasPriceRange = computed(() => minPrice.value > 0 && maxPrice.value > minPrice.value)

const preferredVariant = computed(() => {
  if (!props.product.variants || props.product.variants.length === 0) {
    return null
  }

  // Ir por defecto a la variante de mayor precio para evitar abrir una variante mas barata.
  return [...props.product.variants].sort((a, b) => b.price - a.price)[0]
})

function goToProduct() {
  const bestVariant = preferredVariant.value

  if (bestVariant) {
    router.push({
      path: `/variant/product/${props.product.id}/variant/${bestVariant.id}`,
    })
  }
}
</script>

<template>
  <div
    class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    @click="goToProduct"
  >
    <!-- Header del producto -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <h4
          class="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors"
        >
          {{ product.name }}
        </h4>
        <p class="text-xs text-gray-500 mt-1">{{ product.brand }} - {{ product.model }}</p>
      </div>

      <!-- Match score badge -->
      <div
        v-if="product.match_score"
        class="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full shrink-0"
      >
        {{ product.match_score }}% match
      </div>
    </div>

    <!-- Especificaciones clave -->
    <div v-if="product.specifications.length > 0" class="flex flex-wrap gap-1 mb-3">
      <span
        v-for="spec in product.specifications.slice(0, 3)"
        :key="spec.name"
        class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
      >
        {{ spec.name }}: {{ spec.value }}
      </span>
    </div>

    <!-- Precio y acción -->
    <div class="flex items-center justify-between pt-3 border-t border-gray-100">
      <!-- Precio -->
      <div>
        <p class="text-xs text-gray-500">Precio</p>
        <p v-if="hasPriceRange" class="text-lg font-bold text-blue-600">
          S/. {{ minPrice.toFixed(2) }} - {{ maxPrice.toFixed(2) }}
        </p>
        <p v-else class="text-lg font-bold text-blue-600">S/. {{ maxPrice.toFixed(2) }}</p>
      </div>

      <!-- Botón ver producto -->
      <button
        @click.stop="goToProduct"
        class="px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
      >
        Ver producto
        <i class="fas fa-arrow-right ml-1"></i>
      </button>
    </div>

    <!-- Match reason (si existe) -->
    <div v-if="product.match_reason" class="mt-3 pt-3 border-t border-gray-100">
      <p class="text-xs text-gray-600 italic">
        <i class="fas fa-info-circle text-blue-500 mr-1"></i>
        {{ product.match_reason }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
