<script setup lang="ts">
import noImg from '@/assets/img/no-image.jpg'
import BadgeStatus from '@/components/Admin/BadgeStatus.vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import ToggleSwitch from '@/components/Admin/ToggleSwitch.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { BarcodeItemI } from '@/interfaces/admin/variant/BarcodeInterface'
import type { variantI, variantsI } from '@/interfaces/admin/variant/variantInterface'
import VariantService from '@/services/admin/VariantService'
import ReportService from '@/services/admin/ReportService'
import IaService from '@/services/ia/IaService'
import Swal from 'sweetalert2'
import { computed, onMounted, ref, watch } from 'vue'
import BarcodeCartModal from './components/BarcodeCartModal.vue'
import BarcodeQuantityModal from './components/BarcodeQuantityModal.vue'
import PaginationControls from '@/components/Admin/PaginationControls.vue'

const variantService = new VariantService()
const reportService = new ReportService()
const iaService = new IaService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Inventario' }])

const variants = ref<variantsI | null>(null)
const error = ref<string | null>(null)
const variantsList = computed(() => variants.value?.data ?? [])
const isLoading = ref(true)
const loadedImages = ref<Record<number, boolean>>({})

// ✅ Referencias a los modales
const barcodeQuantityModalRef = ref<InstanceType<typeof BarcodeQuantityModal> | null>(null)
const barcodeCartModalRef = ref<InstanceType<typeof BarcodeCartModal> | null>(null)

// ✅ Variable reactiva para contar items
const cartItemsCount = ref(0)

// Estados para el modal de reporte de stock bajo
const showLowStockModal = ref(false)
const lowStockFormat = ref<'pdf' | 'excel'>('pdf')
const isGeneratingReport = ref(false)

// ✅ SOLUCIÓN CLAVE: Watch automático para sincronizar el contador
watch(
  () => barcodeCartModalRef.value?.items,
  (newItems) => {
    if (newItems) {
      cartItemsCount.value = newItems.reduce((sum, item) => sum + item.quantity, 0)
    } else {
      cartItemsCount.value = 0
    }
  },
  { deep: true, immediate: true },
)

// ✅ NUEVO: Estados de paginación
const currentPage = ref(1)
const perPage = ref(15)

// ✅ NUEVO: Función para calcular el índice global
const getGlobalIndex = (localIndex: number) => {
  return (currentPage.value - 1) * perPage.value + localIndex + 1
}

const loadVariants = async () => {
  try {
    isLoading.value = true
    variants.value = await variantService.getAll()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las variantes.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}


// ✅ NUEVO: Handlers de paginación
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadVariants()
}

const handlePerPageChange = (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  loadVariants()
}

onMounted(() => {
  loadVariants()
})

const updateStatus = async (id: number | string, currentStatus: boolean) => {
  try {
    const newStatus = !currentStatus
    useSweetAlert({
      title: 'Enviando...',
      text: 'Actualizando estado',
      icon: 'loading',
    })
    await variantService.updateStatus({ status: newStatus }, String(id))

    const product = variantsList.value.find((c) => c.id === id)
    if (product) {
      product.status = newStatus
    }

    Swal.close()
  } catch (error) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    console.log(error)
  }
}

// ✅ Funciones para el barcode
const openBarcodeModal = (variant: variantI) => {
  const variantName = `${variant.product.name} - ${variant.product.model}`
  barcodeQuantityModalRef.value?.open(variant.id, variantName, variant.features)
}

const handleBarcodeConfirm = (variantId: number | string, quantity: number) => {
  const variant = variantsList.value.find((v) => v.id === variantId)

  if (!variant) return

  const item: BarcodeItemI = {
    variant_id: variantId,
    quantity: quantity,
    variant_name: `${variant.product.name} - ${variant.product.model}`,
    sku: variant.sku,
    features: variant.features.map((f) => `${f.option}: ${f.description}`).join(', '),
  }

  barcodeCartModalRef.value?.addItem(item)
}

const openCart = () => {
  barcodeCartModalRef.value?.open()
}

const syncCatalog = async () => {
  try {
    useSweetAlert({
      title: 'Sincronizando...',
      text: 'Sincronizando el catálogo con la IA',
      icon: 'loading',
    })
    await iaService.syncCatalog()
    Swal.close()
    useSweetAlert({
      title: 'Sincronización Exitosa',
      text: 'Catálogo sincronizado exitosamente',
      icon: 'success',
    })
  } catch (error) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    console.log(error)
  }
}

// ✅ Funciones para reporte de stock bajo
const openLowStockModal = () => {
  showLowStockModal.value = true
}

const closeLowStockModal = () => {
  showLowStockModal.value = false
}

const generateLowStockReport = async () => {
  try {
    isGeneratingReport.value = true
    useSweetAlert({
      title: 'Generando reporte...',
      text: 'Por favor espera',
      icon: 'loading',
    })

    const response = await reportService.generateLowStockReport({
      format: lowStockFormat.value,
    })

    Swal.close()

    // Descargar el archivo
    reportService.downloadFile(response.file, response.filename)

    useSweetAlert({
      title: '¡Reporte generado!',
      text: 'El archivo se ha descargado correctamente',
      icon: 'success',
      timer: 2000,
    })

    closeLowStockModal()
  } catch (err) {
    useSweetAlert({
      title: 'Error al generar reporte',
      text: 'Intenta de nuevo',
      icon: 'error',
      timer: 0,
    })
    console.error(err)
  } finally {
    isGeneratingReport.value = false
  }
}
</script>

<template>
  <div>
    <!-- ✅ Botón flotante SIEMPRE visible, solo cambia de estilo -->
    <button
      @click="openCart"
      :disabled="cartItemsCount === 0"
      :class="[
        'fixed bottom-6 right-6 z-40',
        'flex items-center gap-2',
        'font-semibold rounded-full',
        'px-5 py-3 shadow-lg',
        'transition-all duration-200',
        cartItemsCount > 0
          ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl cursor-pointer'
          : 'bg-gray-400 text-gray-500 cursor-not-allowed opacity-60',
      ]"
    >
      <font-awesome-icon icon="fa-solid fa-barcode" size="lg" />
      <span class="text-sm">Ver códigos ({{ cartItemsCount }})</span>
    </button>

    <div class="flex justify-between items-center mb-4">
      <!-- Botón de Reporte de Stock Bajo -->
      <button
        @click="openLowStockModal"
        class="px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 rounded-lg transition-colors duration-200 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800 cursor-pointer flex items-center gap-2"
      >
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
        <span>Reporte Stock Bajo</span>
      </button>

      <button
        @click="syncCatalog"
        class="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 rounded-lg transition-colors duration-200 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-800 cursor-pointer"
      >
        Sincronizar catálogo con la IA
      </button>
    </div>

    <AnimationLoader v-if="isLoading" />
    <div v-else-if="variantsList.length != 0">
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead
            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="px-6 py-3">#</th>
              <th scope="col" class="px-6 py-3">Producto</th>
              <th scope="col" class="px-6 py-3">Variante</th>
              <th scope="col" class="px-6 py-3">Precio</th>
              <th scope="col" class="px-6 py-3">Stock</th>
              <th scope="col" class="px-6 py-3">Estado</th>
              <th scope="col" class="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              :class="[
                'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
                index != variantsList.length - 1
                  ? 'border-b dark:border-gray-700 border-gray-200'
                  : '',
              ]"
              v-for="(variant, index) in variantsList"
              :key="index"
            >
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {{ getGlobalIndex(index) }}
              </th>
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="relative w-14 h-14 shrink-0">
                    <div
                      v-if="!loadedImages[index]"
                      role="status"
                      class="absolute inset-0 flex items-center justify-center bg-neutral-quaternary rounded animate-pulse"
                    >
                      <img
                        :src="noImg"
                        alt="Cargando imagen"
                        class="w-6 h-6 object-contain opacity-60"
                      />
                      <span class="sr-only">Loading...</span>
                    </div>

                    <img
                      :src="variant.img[0].url ?? noImg"
                      alt="Imagen de la variante"
                      class="w-14 h-14 object-cover rounded"
                      @load="loadedImages[index] = true"
                      @error="loadedImages[index] = true"
                    />
                  </div>
                  <div class="flex flex-col min-w-0 gap-1">
                    <p class="font-semibold text-gray-900 dark:text-white truncate">
                      {{ variant.product.name }} - {{ variant.product.model }}
                    </p>
                    <p class="text-xs text-gray-400 whitespace-nowrap">
                      {{ variant.sku }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="mt-1 flex flex-wrap gap-2">
                  <span
                    v-for="(item, idx) in variant.features"
                    :key="idx"
                    class="inline-flex text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded px-2 py-0.5 truncate max-w-full"
                  >
                    {{ item.option }} : {{ item.description }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">S/. {{ variant.selling_price }}</td>
              <td class="px-6 py-4">
                {{ variant.branch_stock.stock }}
              </td>
              <td>
                <BadgeStatus :status="variant.status" />
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-around items-center">
                  <!-- ✅ Botón de barcode -->
                  <button
                    @click="openBarcodeModal(variant)"
                    type="button"
                    class="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors cursor-pointer"
                    title="Generar código de barras"
                  >
                    <font-awesome-icon icon="fa-solid fa-barcode" size="xl" />
                  </button>

                  <router-link
                    :to="{ name: 'admin.store.variants.show', params: { id: variant.id } }"
                  >
                    <font-awesome-icon icon="fa-solid fa-eye" size="xl" class="text-green-400" />
                  </router-link>
                  <router-link
                    :to="{ name: 'admin.store.variants.edit', params: { id: variant.id } }"
                  >
                    <font-awesome-icon
                      icon="fa-solid fa-pen-to-square"
                      size="xl"
                      class="text-amber-400"
                    />
                  </router-link>
                  <ToggleSwitch
                    :status="variant.status"
                    @update:status="() => updateStatus(variant.id, variant.status)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <InfoAlert v-else message="Todavía no hay variantes registradas" />

    <!-- ✅ Modales -->
    <BarcodeQuantityModal ref="barcodeQuantityModalRef" @confirm="handleBarcodeConfirm" />
    <BarcodeCartModal ref="barcodeCartModalRef" />

    <!-- Modal de Reporte de Stock Bajo -->
    <div
      v-if="showLowStockModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeLowStockModal"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            Reporte de Stock Bajo
          </h3>
          <button
            @click="closeLowStockModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <font-awesome-icon icon="fa-solid fa-times" size="lg" />
          </button>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Genera un reporte de todas las variantes con stock igual o menor al stock mínimo.
        </p>

        <div class="space-y-4">
          <!-- Formato -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Formato
            </label>
            <div class="flex gap-4">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="lowStockFormat"
                  type="radio"
                  value="pdf"
                  class="mr-2 cursor-pointer"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">PDF</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="lowStockFormat"
                  type="radio"
                  value="excel"
                  class="mr-2 cursor-pointer"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">Excel</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="closeLowStockModal"
            :disabled="isGeneratingReport"
            class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            @click="generateLowStockReport"
            :disabled="isGeneratingReport"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <font-awesome-icon v-if="isGeneratingReport" icon="fa-solid fa-spinner" spin />
            <span>{{ isGeneratingReport ? 'Generando...' : 'Generar' }}</span>
          </button>
        </div>
      </div>
    </div>
    <!-- ✅ NUEVO: Componente de paginación -->
      <PaginationControls
        v-if="variants?.meta"
        :meta="variants.meta"
        :per-page="perPage"
        @update:page="handlePageChange"
        @update:per-page="handlePerPageChange"
      />
  </div>
</template>
