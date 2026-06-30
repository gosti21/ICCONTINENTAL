<script setup lang="ts">
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { salesI } from '@/interfaces/admin/SaleInterface'
import SaleService from '@/services/admin/SaleService'
import ReportService from '@/services/admin/ReportService'
import { computed, onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import PaginationControls from '@/components/Admin/PaginationControls.vue'

const saleService = new SaleService()
const reportService = new ReportService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Ventas' }])

const sales = ref<salesI | null>(null)
const error = ref<string | null>(null)
const salesList = computed(() => sales.value?.data ?? [])
const isLoading = ref(true)

// ✅ NUEVO: Estados de paginación
const currentPage = ref(1)
const perPage = ref(15)

// Estados para el modal de reporte
const showReportModal = ref(false)
const reportDateFrom = ref('')
const reportDateTo = ref('')
const reportFormat = ref<'pdf' | 'excel'>('pdf')
const isGeneratingReport = ref(false)

// ✅ NUEVO: Función para calcular el índice global
const getGlobalIndex = (localIndex: number) => {
  return (currentPage.value - 1) * perPage.value + localIndex + 1
}

const loadSales = async () => {
  try {
    isLoading.value = true
    sales.value = await saleService.getAll(currentPage.value, perPage.value)
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las ventas.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// ✅ NUEVO: Handlers de paginación
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadSales()
}

const handlePerPageChange = (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  loadSales()
}

const openReportModal = () => {
  // Establecer fechas por defecto (último mes)
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

  reportDateFrom.value = lastMonth.toISOString().split('T')[0]
  reportDateTo.value = today.toISOString().split('T')[0]
  showReportModal.value = true
}

const closeReportModal = () => {
  showReportModal.value = false
}

const generateReport = async () => {
  if (!reportDateFrom.value || !reportDateTo.value) {
    useSweetAlert({
      title: 'Campos incompletos',
      text: 'Por favor selecciona ambas fechas',
      icon: 'warning',
      timer: 2000,
    })
    return
  }

  if (new Date(reportDateFrom.value) > new Date(reportDateTo.value)) {
    useSweetAlert({
      title: 'Fechas inválidas',
      text: 'La fecha inicial no puede ser mayor a la fecha final',
      icon: 'warning',
      timer: 2000,
    })
    return
  }

  try {
    isGeneratingReport.value = true
    useSweetAlert({
      title: 'Generando reporte...',
      text: 'Por favor espera',
      icon: 'loading',
    })

    const response = await reportService.generateSalesReport({
      format: reportFormat.value,
      date_from: reportDateFrom.value,
      date_to: reportDateTo.value,
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

    closeReportModal()
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

onMounted(() => {
  loadSales()
})
</script>

<template>
  <div>
    <!-- Botón para generar reporte -->
    <div class="flex justify-end mb-4">
      <button
        @click="openReportModal"
        class="px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 rounded-lg transition-colors duration-200 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 cursor-pointer flex items-center gap-2"
      >
        <font-awesome-icon icon="fa-solid fa-file-export" />
        <span>Generar Reporte</span>
      </button>
    </div>

    <AnimationLoader v-if="isLoading" />
    <div v-else-if="salesList.length != 0">
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead
            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="px-6 py-3">#</th>
              <th scope="col" class="px-6 py-3">Tipo de Voucher</th>
              <th scope="col" class="px-6 py-3">N° Orden</th>
              <th scope="col" class="px-6 py-3">Tipo de Venta</th>
              <th scope="col" class="px-6 py-3">Empleado</th>
              <th scope="col" class="px-6 py-3">Cliente</th>
              <th scope="col" class="px-6 py-3">Total</th>
              <th scope="col" class="px-6 py-3">Voucher</th>
            </tr>
          </thead>
          <tbody>
            <tr
              :class="[
                'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
                index != salesList.length - 1
                  ? 'border-b dark:border-gray-700 border-gray-200'
                  : '',
              ]"
              v-for="(sale, index) in salesList"
              :key="index"
            >
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {{ getGlobalIndex(index) }}
              </th>
              <td class="px-6 py-4">
                {{ sale.type_voucher }}
              </td>
              <td class="px-6 py-4">
                {{ sale.order_number }}
              </td>
              <td class="px-6 py-4">
                {{ sale.type_sale }}
              </td>
              <td class="px-6 py-4">
                <div class="line-clamp-2 block truncate">
                  {{ sale.employee }}
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="w-32 line-clamp-2 block">
                  {{ sale.customer }}
                </div>
              </td>
              <td class="px-6 py-4">S/. {{ sale.total }}</td>
              <td class="px-6 py-4">
                <a :href="sale.path" target="__blank">
                  <font-awesome-icon icon="fa-solid fa-receipt" size="xl" class="text-green-400" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- ✅ NUEVO: Componente de paginación -->
      <PaginationControls
        v-if="sales?.meta"
        :meta="sales.meta"
        :per-page="perPage"
        @update:page="handlePageChange"
        @update:per-page="handlePerPageChange"
      />
    </div>
    <InfoAlert v-else message="Todavía no hay ventas registradas" />

    <!-- Modal de Reporte -->
    <div
      v-if="showReportModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeReportModal"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            Generar Reporte de Ventas
          </h3>
          <button
            @click="closeReportModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <font-awesome-icon icon="fa-solid fa-times" size="lg" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Fecha desde -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha desde
            </label>
            <input
              v-model="reportDateFrom"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Fecha hasta -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha hasta
            </label>
            <input
              v-model="reportDateTo"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Formato -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Formato
            </label>
            <div class="flex gap-4">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="reportFormat"
                  type="radio"
                  value="pdf"
                  class="mr-2 cursor-pointer"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">PDF</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="reportFormat"
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
            @click="closeReportModal"
            :disabled="isGeneratingReport"
            class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            @click="generateReport"
            :disabled="isGeneratingReport"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <font-awesome-icon
              v-if="isGeneratingReport"
              icon="fa-solid fa-spinner"
              spin
            />
            <span>{{ isGeneratingReport ? 'Generando...' : 'Generar' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
