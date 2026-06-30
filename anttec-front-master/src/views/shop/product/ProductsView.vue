<script setup lang="ts">
import noImg from '@/assets/img/no-image.jpg'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { categorySI, subSI } from '@/interfaces/shop/CategorySInterface'
import type { ProductFiltersI } from '@/interfaces/shop/Product/ProductFilterSInterface'
import type { productSI } from '@/interfaces/shop/Product/ProductSInterface'
import CategorySService from '@/services/shop/CategorySService'
import ProductSService from '@/services/shop/ProductSService'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrumb from '@/components/shop/BreadCrumb.vue'
import type { BreadcrumbInterface } from '@/components/shop/interface/breadcrumbInterface'

const categorySService = new CategorySService()
const productSService = new ProductSService()

const route = useRoute()
const router = useRouter()
const products = ref<productSI[]>([])
const isLoading = ref(true)
const categoryInfo = ref<categorySI | null>(null)
const subcategoryInfo = ref<subSI | null>(null)

// Cargar info de categoría/subcategoría usando IDs
const loadCategoryInfo = async () => {
  try {
    if (route.params.categoryId) {
      categoryInfo.value = await categorySService.getById(route.params.categoryId as string)

      // Si hay subcategoría, buscarla dentro de la categoría
      if (route.params.subcategoryId && categoryInfo.value.subcategories) {
        subcategoryInfo.value =
          categoryInfo.value.subcategories.find(
            (sub) => sub.id === Number(route.params.subcategoryId),
          ) || null
      } else {
        subcategoryInfo.value = null
      }
    } else {
      categoryInfo.value = null
      subcategoryInfo.value = null
    }
  } catch (error) {
    console.error('Error cargando información de categoría:', error)
  }
}

// Construye filtros directamente con los IDs de la URL
const filters = computed<ProductFiltersI>(() => {
  const result: ProductFiltersI = {}

  // 1. ID de categoría directo desde la URL
  if (route.params.categoryId) {
    result.category = Number(route.params.categoryId)
  }

  // 2. ID de subcategoría directo desde la URL
  if (route.params.subcategoryId) {
    result.subcategory = Number(route.params.subcategoryId)
  }
  return result
})

// Título dinámico
const pageTitle = computed(() => {
  if (subcategoryInfo.value) {
    return subcategoryInfo.value.name
  }
  if (categoryInfo.value) {
    return categoryInfo.value.name
  }
  return 'Todos los productos'
})

// Cargar productos
const loadProducts = async () => {
  isLoading.value = true

  try {
    // Primero cargar la info de categoría para mostrar en UI
    await loadCategoryInfo()

    // Cargar productos (los filtros ya tienen los IDs)
    const data = await productSService.getWithFilters(filters.value)

    // Agregar imgLoaded a cada producto
    products.value = data.data.map((product) => ({
      ...product,
      variant: {
        ...product.variant,
        imgLoaded: false,
      },
    }))
  } catch (error) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar los productos',
      icon: 'error',
      timer: 0,
    })
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleImageLoad = (index: number) => {
  if (products.value[index]) {
    products.value[index].variant.imgLoaded = true
  }
}

// Cambiar ordenamiento
const changeSort = (sortValue: string) => {
  router.push({
    name: route.name as string,
    params: route.params,
    query: { ...route.query, sort: sortValue },
  })
}

// Recargar cuando cambien params o queries
watch([() => route.params, () => route.query], loadProducts, { deep: true })

onMounted(loadProducts)

const breadcrumbs = computed<BreadcrumbInterface[]>(() => {
  const crumbs: BreadcrumbInterface[] = []

  if (categoryInfo.value) {
    crumbs.push({
      name: categoryInfo.value.name,
      route: 'shop.products.category',
      params: { categoryId: route.params.categoryId },
    })

    if (subcategoryInfo.value) {
      crumbs.push({
        name: subcategoryInfo.value.name,
        // no ponemos route porque es la última y no necesita link
      })
    }
  } else {
    crumbs.push({ name: 'Productos' })
  }

  return crumbs
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <BreadCrumb :breadcrumbs="breadcrumbs" class="mb-5" />

    <!-- Header con título y contador -->
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ pageTitle }}
        </h1>
        <p v-if="!isLoading" class="text-gray-600 dark:text-gray-400">
          {{ products.length }} producto{{ products.length !== 1 ? 's' : '' }} encontrado{{
            products.length !== 1 ? 's' : ''
          }}
        </p>
      </div>

      <!-- Ordenar -->
      <div class="w-full sm:w-auto">
        <select
          :value="route.query.sort || 'newest'"
          @change="changeSort(($event.target as HTMLSelectElement).value)"
          class="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="newest">Más recientes</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
          <option value="name_asc">Nombre: A-Z</option>
          <option value="name_desc">Nombre: Z-A</option>
        </select>
      </div>
    </div>

    <!-- Grid de productos -->
    <div>
      <!-- Loading Skeleton -->
      <div
        v-if="isLoading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        <div
          v-for="n in 8"
          :key="n"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div class="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <img :src="noImg" alt="Cargando" class="w-12 h-12 opacity-30" />
          </div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-4"></div>
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div
        v-else-if="products.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        <article
          v-for="(product, index) in products"
          :key="product.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
        >
          <router-link
            :to="{
              name: 'shop.variant.show',
              params: { productId: product.id, variantId: product.variant.id },
            }"
            class="flex flex-col h-full"
          >
            <!-- Image Container -->
            <div class="relative w-full h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div
                v-if="!product.variant.imgLoaded"
                class="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse"
              >
                <img :src="noImg" alt="Cargando" class="w-12 h-12 opacity-30" />
              </div>

              <img
                :src="product.variant.image || noImg"
                :alt="`${product.name} - ${product.model}`"
                loading="lazy"
                class="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-110"
                :class="{ 'opacity-0': !product.variant.imgLoaded }"
                @load="handleImageLoad(index)"
                @error="handleImageLoad(index)"
              />
            </div>

            <!-- Content -->
            <div class="p-4 flex flex-col grow">
              <span
                class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2"
              >
                {{ product.brand }}
              </span>

              <h3
                class="text-base sm:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 min-h-12 mb-2 grow"
              >
                {{ product.name }} - {{ product.model }}
              </h3>

              <div class="mt-auto">
                <p class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  S/. {{ product.variant.selling_price }}
                </p>

                <span
                  class="block w-full text-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform group-hover:scale-105 shadow-md"
                >
                  Ver producto
                </span>
              </div>
            </div>
          </router-link>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <InfoAlert message="No se encontraron productos con los filtros seleccionados" />
      </div>
    </div>
  </div>
</template>

<style scoped>
article {
  min-height: 450px;
}

img {
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}

article:hover {
  transform: translateY(-4px);
}
</style>
