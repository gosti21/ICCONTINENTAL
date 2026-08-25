<script setup lang="ts">
import noImg from '@/assets/img/no-image.jpg'
import type { productSI } from '@/interfaces/shop/Product/ProductSInterface'
import ProductSService from '@/services/shop/ProductSService'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

defineProps<{ isMobile?: boolean }>()

const router = useRouter()
const productService = new ProductSService()
const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const query = ref('')
const results = ref<productSI[]>([])
const isLoading = ref(false)
const isOpen = ref(false)
const error = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | undefined
let requestSequence = 0

const search = async () => {
  const term = query.value.trim()
  const sequence = ++requestSequence

  if (term.length < 2) {
    results.value = []
    error.value = ''
    isLoading.value = false
    isOpen.value = term.length > 0
    return
  }

  isLoading.value = true
  isOpen.value = true
  error.value = ''

  try {
    const response = await productService.getWithFilters({ search: term, limit: 6 })
    if (sequence !== requestSequence) return
    results.value = response.data.filter((product) => product.variant).slice(0, 6)
  } catch {
    if (sequence !== requestSequence) return
    results.value = []
    error.value = 'No pudimos buscar en este momento.'
  } finally {
    if (sequence === requestSequence) isLoading.value = false
  }
}

watch(query, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(search, 300)
})

const openProduct = async (product: productSI) => {
  isOpen.value = false
  await router.push({
    name: 'shop.variant.show',
    params: { productId: product.id, variantId: product.variant.id },
  })
}

const submit = () => {
  if (results.value[0]) openProduct(results.value[0])
  else search()
}

const clearSearch = async () => {
  query.value = ''
  results.value = []
  isOpen.value = false
  await nextTick()
  input.value?.focus()
}

const closeOnOutsideClick = (event: MouseEvent) => {
  if (!root.value?.contains(event.target as Node)) isOpen.value = false
}

document.addEventListener('click', closeOnOutsideClick)
onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  document.removeEventListener('click', closeOnOutsideClick)
})
</script>

<template>
  <div ref="root" class="relative" :class="isMobile ? 'w-full' : 'w-full max-w-2xl'">
    <form class="relative" role="search" @submit.prevent="submit">
      <div class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
        <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="text-gray-400" />
      </div>
      <input
        ref="input"
        v-model="query"
        type="search"
        autocomplete="off"
        aria-label="Buscar productos"
        placeholder="Buscar por producto, modelo, marca o SKU..."
        class="w-full border-2 border-indigo-500 rounded-2xl ps-12 pe-12 py-3 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        @focus="isOpen = query.trim().length > 0"
        @keydown.esc="isOpen = false"
      />
      <button
        v-if="query"
        type="button"
        aria-label="Limpiar búsqueda"
        class="absolute inset-y-0 end-0 px-4 text-gray-400 hover:text-orange-600 cursor-pointer"
        @click="clearSearch"
      >
        <font-awesome-icon icon="fa-solid fa-xmark" />
      </button>
    </form>

    <div
      v-if="isOpen"
      class="absolute z-[60] mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl"
    >
      <div v-if="query.trim().length < 2" class="px-5 py-4 text-sm text-gray-500">
        Escribe al menos 2 caracteres para buscar.
      </div>
      <div v-else-if="isLoading" class="flex items-center gap-3 px-5 py-5 text-sm text-gray-500">
        <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-orange-500" />
        Buscando productos...
      </div>
      <div v-else-if="error" class="px-5 py-4 text-sm text-red-600">{{ error }}</div>
      <div v-else-if="results.length === 0" class="px-5 py-5 text-center">
        <p class="font-semibold">No encontramos “{{ query.trim() }}”</p>
        <p class="mt-1 text-sm text-gray-500">Prueba con otra marca, modelo o código SKU.</p>
      </div>
      <ul v-else aria-label="Resultados de búsqueda">
        <li v-for="product in results" :key="product.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition last:border-0 hover:bg-orange-50 focus:bg-orange-50 focus:outline-none"
            @click="openProduct(product)"
          >
            <img
              :src="product.variant.image || noImg"
              :alt="product.name"
              class="h-14 w-14 shrink-0 rounded-xl bg-gray-100 object-cover"
              @error="($event.target as HTMLImageElement).src = noImg"
            />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-xs font-bold uppercase tracking-wide text-orange-600">
                {{ product.brand }}
              </span>
              <span class="block truncate font-semibold">{{ product.name }} · {{ product.model }}</span>
              <span class="text-sm text-gray-500">Stock: {{ product.variant.stock }}</span>
            </span>
            <span class="shrink-0 font-bold">S/ {{ product.variant.selling_price }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
