<script setup lang="ts">
import noImg from '@/assets/img/no-image.jpg'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import CoverSlider from '@/components/shop/CoverSlider.vue'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { productSI } from '@/interfaces/shop/Product/ProductSInterface'
import ProductSService from '@/services/shop/ProductSService'
import { computed, onMounted, ref } from 'vue'

const productSService = new ProductSService()

const productLasts = ref<productSI[] | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(true)
const productLastList = computed(() => productLasts.value ?? [])

const loadProductList = async () => {
  try {
    const data = await productSService.getAllLasts()
    // Agregar imgLoaded en false a cada variante
    productLasts.value = data.map((product) => ({
      ...product,
      variant: {
        ...product.variant,
        imgLoaded: false,
      },
    }))
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar los productos.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const handleImageLoad = (index: number) => {
  if (productLasts.value && productLasts.value[index]) {
    productLasts.value[index].variant.imgLoaded = true
  }
}

onMounted(() => {
  loadProductList()
})
</script>

<template>
  <CoverSlider />
  <section class="border-b border-slate-200 bg-white">
    <div class="container mx-auto grid grid-cols-2 gap-5 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:px-8">
      <div class="flex items-center gap-3"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600"><font-awesome-icon icon="fa-solid fa-screwdriver-wrench" /></span><div><strong class="block text-sm text-slate-900">Asesoría técnica</strong><span class="text-xs text-slate-500">Compra con precisión</span></div></div>
      <div class="flex items-center gap-3"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600"><font-awesome-icon icon="fa-solid fa-truck-fast" /></span><div><strong class="block text-sm text-slate-900">Envíos seguros</strong><span class="text-xs text-slate-500">Seguimiento de pedidos</span></div></div>
      <div class="flex items-center gap-3"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600"><font-awesome-icon icon="fa-solid fa-shield" /></span><div><strong class="block text-sm text-slate-900">Compra protegida</strong><span class="text-xs text-slate-500">Pago confiable</span></div></div>
      <div class="flex items-center gap-3"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600"><font-awesome-icon icon="fa-solid fa-headset" /></span><div><strong class="block text-sm text-slate-900">Soporte directo</strong><span class="text-xs text-slate-500">Atención personalizada</span></div></div>
    </div>
  </section>

  <section id="productos-destacados" class="bg-slate-50 scroll-mt-40">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
    <div class="mb-9">
      <span class="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-600">Catálogo destacado</span>
      <h2 class="mt-2 text-3xl lg:text-4xl font-black text-slate-950 dark:text-gray-100">
        Últimos productos
      </h2>
      <p class="text-slate-600 dark:text-gray-400 mt-2">Soluciones seleccionadas para trabajos que no pueden fallar.</p>
    </div>

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
        <!-- Skeleton Image -->
        <div class="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <img :src="noImg" alt="Cargando" class="w-12 h-12 opacity-30" />
        </div>

        <!-- Skeleton Content -->
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
      v-else-if="productLastList.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
    >
      <article
        v-for="(product, index) in productLastList"
        :key="product.id"
        class="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 overflow-hidden group flex flex-col"
      >
        <router-link
          :to="{
            name: 'shop.variant.show',
            params: { productId: product.id, variantId: product.variant.id },
          }"
          class="flex flex-col h-full"
        >
          <!-- Image Container -->
          <div class="relative w-full h-64 bg-gray-100 dark:bg-gray-50 overflow-hidden p-2">
            <!-- Skeleton for image -->
            <div
              v-if="!product.variant.imgLoaded"
              class="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse"
            >
              <img :src="noImg" alt="Cargando" class="w-12 h-12 opacity-30" />
            </div>

            <!-- Product Image -->
            <img
              :src="product.variant.image || noImg"
              :alt="`${product.name} - ${product.model}`"
              loading="lazy"
              class="w-full h-full object-contain object-center transition-all duration-300 group-hover:scale-110"
              :class="{ 'opacity-0': !product.variant.imgLoaded }"
              @load="handleImageLoad(index)"
              @error="handleImageLoad(index)"
            />
          </div>

          <!-- Content -->
          <div class="p-4 flex flex-col grow">
            <!-- Brand -->
            <span
              class="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2"
            >
              {{ product.brand }}
            </span>

            <!-- Product Name -->
            <h3
              class="text-base sm:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 min-h-12 mb-2 grow"
            >
              {{ product.name }} - {{ product.model }}
            </h3>

            <!-- Price -->
            <div class="mt-auto">
              <p class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                S/. {{ product.variant.selling_price }}
              </p>

              <!-- Button -->
              <span
                class="block w-full text-center bg-slate-950 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md"
              >
                Ver Producto
              </span>
            </div>
          </div>
        </router-link>
      </article>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <InfoAlert message="Aún no hay productos disponibles" />
    </div>
  </div>
  </section>
</template>

<style scoped>
/* Asegura que el contenedor del producto tenga una altura mínima consistente */
article {
  min-height: 450px;
}

/* Mejora la transición de las imágenes */
img {
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}

/* Efecto hover mejorado */
article:hover {
  transform: translateY(-4px);
}
</style>
