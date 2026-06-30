<script setup lang="ts">
import AnimationLoader from '@/components/AnimationLoader.vue'
import productVariantView from './Variant/productVariantView.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import type { ProductExtendI } from '@/interfaces/admin/product/ProductInterface'
import type { variantShortsI } from '@/interfaces/admin/variant/variantShortInterface'
import ProductService from '@/services/admin/ProductService'
import VariantService from '@/services/admin/VariantService'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const productService = new ProductService()
const variantService = new VariantService()

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const product = ref<ProductExtendI | null>(null)
const variants = ref<variantShortsI | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Productos', route: 'admin.catalog.products' },
  { name: product.value ? `Detalle - ${product.value.name}` : 'Detalle' },
])

const loadProduct = async () => {
  try {
    // Carga todo en paralelo con Promise.all
    const [productData, variantsData] = await Promise.all([
      productService.getById(id),
      variantService.getAllShort(id),
      productService.hasOptions(id),
    ])

    product.value = productData
    variants.value = variantsData
  } catch (err) {
    error.value = 'Error al cargar los datos.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <div v-else>
    <div class="flex justify-end gap-6">
      <router-link
        :to="{ name: 'admin.catalog.products.show.options' }"
        class="mb-3 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
      >
        Asociar Opciones
      </router-link>
      <router-link
        :to="{ name: 'admin.catalog.products.show.variants.create' }"
        class="mb-3 focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900"
      >
        Crear Variante
      </router-link>
    </div>

    <!-- Información del Producto -->
    <section class="mb-8">
      <h5 class="text-center text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Detalles del Producto
      </h5>
      <div>
        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Nombre:</h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg">{{ product?.name }}</p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Modelo:</h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg">{{ product?.model }}</p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Marca:</h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg">{{ product?.brand.name }}</p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Categoría:</h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg">{{ product?.category.name }}</p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">SubCategoría:</h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg">{{ product?.subcategory.name }}</p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Descripción:</h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg whitespace-pre-line">
            {{ product?.description ?? 'No tiene descripción' }}
          </p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium mb-3 text-center">
            Especificaciones:
          </h6>
          <div v-if="!product?.specifications">
            <p class="text-gray-500 dark:text-gray-300 text-lg whitespace-pre-line">
              No tiene especificaciones asociadas
            </p>
          </div>
          <div class="w-full flex justify-center" v-else>
            <div class="max-w-md w-full">
              <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-left rtl:text-right text-gray-500 dark:text-gray-300">
                  <thead
                    class="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300"
                  >
                    <tr>
                      <th scope="col" class="px-6 py-3">Nombre</th>
                      <th scope="col" class="px-6 py-3">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      :class="[
                        'bg-white dark:bg-gray-800',
                        index != product?.specifications.length - 1
                          ? 'border-b dark:border-gray-700 border-gray-200'
                          : '',
                      ]"
                      v-for="(specification, index) in product?.specifications"
                      :key="index"
                    >
                      <td class="px-6 py-4">
                        {{ specification.name }}
                      </td>
                      <td class="px-6 py-4">
                        {{ specification.value }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Componente de Variantes -->
    <productVariantView :variants="variants" />
  </div>
</template>
