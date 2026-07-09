<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BreadCrumb from '@/components/shop/BreadCrumb.vue'
import type { BreadcrumbInterface } from '@/components/shop/interface/breadcrumbInterface'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { variantSI } from '@/interfaces/shop/Variant/VariantSInterface'
import VariantSService from '@/services/shop/VariantSService'
import VariantImgGallery from './components/VariantImgGallery.vue'
import VariantQuantityInput from './components/VariantQuantityInput.vue'
import VariantSelector from './components/VariantSelector.vue'
import VariantSpecifications from './components/VariantSpecifications.vue'
import { useCart } from '@/composables/useCart'

const variantSService = new VariantSService()

const route = useRoute()
const router = useRouter()

const product = ref<variantSI | null>(null)
const isLoading = ref(true)
const quantity = ref(1)
const swiperKey = ref(0)
const selectedFeatureId = ref<number | null>(null)

// Composable del carrito
const { addToCart: addToCartComposable, isInCart, getItemQuantity } = useCart()

// Cargar producto
const loadProduct = async () => {
  isLoading.value = true

  try {
    const productId = route.params.productId as string
    const variantId = route.params.variantId as string

    const data = await variantSService.getVariant(productId, variantId)

    product.value = {
      ...data,
      selected_variant: {
        ...data.selected_variant,
        images: data.selected_variant.images.map((img) => ({ ...img, imgLoaded: false })),
      },
    } as variantSI

    // Iniciar sin selección para evitar múltiples opciones activas por defecto.
    selectedFeatureId.value = null

    // Reset cantidad al cargar nueva variante
    quantity.value = 1

    await nextTick()
    swiperKey.value++
  } catch (error) {
    console.error('Error cargando producto:', error)
    
  } finally {
    isLoading.value = false
  }
}

// Manejar carga de imágenes
const handleImageLoad = (index: number) => {
  if (product.value?.selected_variant.images[index]) {
    product.value.selected_variant.images[index].imgLoaded = true
  }
}

// Breadcrumbs
const breadcrumbs = computed<BreadcrumbInterface[]>(() => {
  if (!product.value) return []

  const crumbs: BreadcrumbInterface[] = []

  if (product.value.category) {
    crumbs.push({
      name: product.value.category.name,
      route: 'shop.products.category',
      params: { categoryId: product.value.category.id },
    })
  }

  if (product.value.subcategory) {
    crumbs.push({
      name: product.value.subcategory.name,
      route: 'shop.products.category.subcategory',
      params: {
        categoryId: product.value.category.id,
        subcategoryId: product.value.subcategory.id,
      },
    })
  }

  crumbs.push({
    name: product.value.name,
  })

  return crumbs
})

// Agrupar features por opción
const groupedFeatures = computed(() => {
  if (!product.value) return {}

  const groups: Record<string, (typeof product.value.variants)[0]['features']> = {}

  product.value.variants.forEach((variant) => {
    variant.features.forEach((feature) => {
      if (!groups[feature.option]) {
        groups[feature.option] = []
      }
      if (!groups[feature.option].some((f) => f.id === feature.id)) {
        groups[feature.option].push(feature)
      }
    })
  })

  return groups
})

const flatFeatures = computed(() => Object.values(groupedFeatures.value).flat())

// Obtener features seleccionadas actualmente
const selectedFeatures = computed(() => {
  const features = flatFeatures.value
  if (selectedFeatureId.value === null) return []
  return features.filter((feature) => feature.id === selectedFeatureId.value)
})

// Verificar si una feature está seleccionada
const isFeatureSelected = (featureId: number) => {
  return selectedFeatureId.value === featureId
}

// Verificar disponibilidad de feature
const isFeatureAvailable = (featureId: number, _optionName: string) => {
  if (!product.value) return false

  // Regla solicitada: solo una opción activa a la vez.
  if (selectedFeatureId.value !== null && selectedFeatureId.value !== featureId) {
    return false
  }

  return product.value.variants.some((variant) => variant.features.some((vf) => vf.id === featureId))
}

// Seleccionar feature y navegar a la variante correspondiente
const selectFeature = (featureId: number, _optionName: string) => {
  if (!product.value) return

  // Toggle para permitir deselección.
  if (selectedFeatureId.value === featureId) {
    selectedFeatureId.value = null
    return
  }

  selectedFeatureId.value = featureId

  const targetVariant = product.value.variants.find((variant) =>
    variant.features.some((vf) => vf.id === featureId),
  )

  if (targetVariant) {
    router.push({
      name: 'shop.variant.show',
      params: {
        productId: product.value.id,
        variantId: targetVariant.id,
      },
    })
  }
}

// Agregar al carrito mejorado
const addToCart = async () => {
  if (!product.value) return

  // Validación de cantidad
  if (quantity.value < 1 || quantity.value > product.value.selected_variant.stock) {
    useSweetAlert({
      title: 'Cantidad inválida',
      text: `Por favor ingresa una cantidad entre 1 y ${product.value.selected_variant.stock}`,
      icon: 'warning',
      timer: 3000,
    })
    return
  }

  // Validar stock disponible
  if (quantity.value > product.value.selected_variant.stock) {
    useSweetAlert({
      title: 'Stock insuficiente',
      text: `Solo hay ${product.value.selected_variant.stock} unidades disponibles`,
      icon: 'warning',
      timer: 3000,
    })
    return
  }

  // Obtener el branch_variant_id del producto
  const branchVariantId = product.value.selected_variant.branch_variant_id

  // Agregar al carrito usando el composable
  const success = await addToCartComposable(branchVariantId, quantity.value)

  if (success) {
    // Resetear cantidad después de agregar exitosamente
    quantity.value = 1
  }
}

// Computed para verificar si está en el carrito
const isProductInCart = computed(() => {
  if (!product.value?.selected_variant.branch_variant_id) return false
  return isInCart(product.value.selected_variant.branch_variant_id)
})

// Computed para obtener cantidad en el carrito
const cartQuantity = computed(() => {
  if (!product.value?.selected_variant.branch_variant_id) return 0
  return getItemQuantity(product.value.selected_variant.branch_variant_id)
})

// Recargar cuando cambie la ruta
watch(
  () => route.params,
  async () => {
    await loadProduct()
  },
  { deep: true },
)

onMounted(loadProduct)

onBeforeUnmount(() => {
  product.value = null
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 lg:py-8">
    <!-- Breadcrumb -->
    <BreadCrumb v-if="!isLoading" :breadcrumbs="breadcrumbs" class="mb-6" />

    <!-- Skeleton Loading -->
    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Skeleton Imágenes -->
      <div class="space-y-4">
        <div
          class="w-full aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"
        ></div>
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="i in 4"
            :key="i"
            class="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse rounded"
          ></div>
        </div>
      </div>

      <!-- Skeleton Info -->
      <div class="space-y-6">
        <div class="h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-3/4"></div>
        <div class="h-6 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-1/2"></div>
        <div class="h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-1/3"></div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-5/6"></div>
        </div>
      </div>
    </div>

    <!-- Contenido del Producto -->
    <div v-else-if="product">
      <!-- Grid Principal: Imagen + Información -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
        <!-- Galería de Imágenes -->
        <VariantImgGallery
          :images="product.selected_variant.images"
          :product-name="product.name"
          :swiper-key="swiperKey"
          @image-load="handleImageLoad"
        />

        <!-- Información del Producto -->
        <div class="space-y-4">
          <!-- Marca -->
          <div
            class="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold"
          >
            {{ product.brand }}
          </div>

          <!-- Nombre -->
          <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {{ product.name }}
          </h1>

          <!-- Modelo y SKU -->
          <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span
              >Modelo: <span class="font-medium">{{ product.model }}</span></span
            >
            <span class="text-gray-300 dark:text-gray-700">|</span>
            <span
              >SKU: <span class="font-medium">{{ product.selected_variant.sku }}</span></span
            >
          </div>

          <!-- Precio -->
          <div class="flex items-baseline gap-3 py-3">
            <span class="text-4xl font-bold text-gray-900 dark:text-gray-100">
              S/ {{ product.selected_variant.price }}
            </span>
          </div>

          <!-- Stock -->
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full"
              :class="
                product.selected_variant.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              "
            ></div>
            <span
              class="text-sm font-semibold"
              :class="
                product.selected_variant.stock > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              "
            >
              {{
                product.selected_variant.stock > 0
                  ? `${product.selected_variant.stock} disponibles`
                  : 'Agotado'
              }}
            </span>
          </div>

          <!-- Selector de Variantes -->
          <VariantSelector
            :grouped-features="groupedFeatures"
            :selected-features="selectedFeatures"
            :is-feature-selected="isFeatureSelected"
            :is-feature-available="isFeatureAvailable"
            @select-feature="selectFeature"
          />

          <p class="text-xs text-gray-500 dark:text-gray-400">
            Puedes seleccionar una sola opción a la vez. Haz clic nuevamente para deseleccionarla.
          </p>

          <!-- Cantidad y Acciones -->
          <div class="space-y-4 pt-4">
            <!-- Input de Cantidad -->
            <VariantQuantityInput
              v-model="quantity"
              :max-stock="product.selected_variant.stock"
              :disabled="product.selected_variant.stock === 0"
            />

            <!-- Botones de Acción -->
            <div class="flex gap-3 pt-3">
              <button
                @click="addToCart"
                :disabled="product.selected_variant.stock === 0"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span class="flex items-center justify-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-cart-shopping" />
                  {{ isProductInCart ? 'Actualizar carrito' : 'Agregar al carrito' }}
                </span>
              </button>
            </div>

            <!-- Mostrar si ya está en el carrito -->
            <div
              v-if="isProductInCart"
              class="text-sm text-green-600 dark:text-green-400 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg"
            >
              <font-awesome-icon icon="fa-solid fa-circle-check" />
              Ya tienes {{ cartQuantity }} unidad{{ cartQuantity > 1 ? 'es' : '' }} en el carrito
            </div>

            <!-- Métodos de Entrega -->
            <div>
              <h3
                class="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide mt-5"
              >
                Métodos de entrega:
              </h3>
              <div class="space-y-3">
                <!-- Despacho a domicilio -->
                <div class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div
                    class="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg"
                  >
                    <font-awesome-icon
                      icon="fa-solid fa-truck-fast"
                      class="text-blue-600 dark:text-blue-400 text-lg"
                    />
                  </div>
                  <p class="text-sm font-medium">Despacho a domicilio</p>
                </div>

                <!-- Recojo en tienda -->
                <div class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div
                    class="w-10 h-10 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-lg"
                  >
                    <font-awesome-icon
                      icon="fa-solid fa-shop"
                      class="text-green-600 dark:text-green-400 text-lg"
                    />
                  </div>
                  <p class="text-sm font-medium">Recojo en tienda</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Descripción y Especificaciones -->
      <VariantSpecifications
        :description="product.description"
        :specifications="product.specifications"
      />
    </div>
  </div>
</template>

<style scoped>
/* Animación pulse suave para stock */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
