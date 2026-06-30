<script setup lang="ts">
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import ProductService from '@/services/admin/ProductService'
import { computed, onMounted, ref } from 'vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import ButtonCreate from '@/components/Admin/ButtonCreate.vue'
import ToggleSwitch from '@/components/Admin/ToggleSwitch.vue'
import Swal from 'sweetalert2'
import BadgeStatus from '@/components/Admin/BadgeStatus.vue'
import type { ProductsI } from '@/interfaces/admin/product/ProductInterface'
import PaginationControls from '@/components/Admin/PaginationControls.vue'

const productService = new ProductService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Productos' }])

const products = ref<ProductsI | null>(null)
const error = ref<string | null>(null)
const productsList = computed(() => products.value?.data ?? [])
const isLoading = ref(true)


// ✅ NUEVO: Estados de paginación
const currentPage = ref(1)
const perPage = ref(15)

// ✅ NUEVO: Función para calcular el índice global
const getGlobalIndex = (localIndex: number) => {
  return (currentPage.value - 1) * perPage.value + localIndex + 1
}

const loadProducts = async () => {
  try {
    isLoading.value = true
    products.value = await productService.getAll(currentPage.value, perPage.value)
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar los productos.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// ✅ NUEVO: Handlers de paginación
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadProducts()
}

const handlePerPageChange = (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  loadProducts()
}

onMounted(() => {
  loadProducts()
})

const updateStatus = async (id: number, currentStatus: boolean) => {
  try {
    const newStatus = !currentStatus
    useSweetAlert({
      title: 'Enviando...',
      text: 'Actualizando estado',
      icon: 'loading',
    })
    await productService.update({ status: newStatus }, String(id))

    const product = productsList.value.find((c) => c.id === id)
    if (product) {
      product.status = newStatus
    }

    Swal.close()
  } catch (error) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    console.log(error)
  }
}
</script>

<template>
  <div class="flex justify-end">
    <ButtonCreate route="admin.catalog.products.create" />
  </div>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="productsList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Modelo</th>
            <th scope="col" class="px-6 py-3">Subcategoría</th>
            <th scope="col" class="px-6 py-3">Marca</th>
            <th scope="col" class="px-6 py-3">Estado</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != productsList.length - 1
                ? 'border-b dark:border-gray-700 border-gray-200'
                : '',
            ]"
            v-for="(product, index) in productsList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ getGlobalIndex(index) }}
            </th>
            <td class="px-6 py-4">
              {{ product.name }}
            </td>
            <td class="px-6 py-4">
              {{ product.model }}
            </td>
            <td class="px-6 py-4">
              {{ product.subcategory }}
            </td>
            <td class="px-6 py-4">
              {{ product.brand }}
            </td>
            <td>
              <BadgeStatus :status="product.status" />
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-around">
                <router-link
                  :to="{ name: 'admin.catalog.products.show', params: { id: product.id } }"
                >
                  <font-awesome-icon icon="fa-solid fa-eye" size="xl" class="text-green-400" />
                </router-link>
                <router-link
                  :to="{ name: 'admin.catalog.products.edit', params: { id: product.id } }"
                >
                  <font-awesome-icon
                    icon="fa-solid fa-pen-to-square"
                    size="xl"
                    class="text-amber-400"
                  />
                </router-link>
                <ToggleSwitch
                  :status="product.status"
                  @update:status="() => updateStatus(product.id, product.status)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- ✅ NUEVO: Componente de paginación -->
      <PaginationControls
        v-if="products?.meta"
        :meta="products.meta"
        :per-page="perPage"
        @update:page="handlePageChange"
        @update:per-page="handlePerPageChange"
      />
  </div>
  <InfoAlert v-else message="Todavía no hay productos registrados" />
</template>
