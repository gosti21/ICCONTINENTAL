<script setup lang="ts">
import pdfSvg from '@/assets/svg/pdf.svg'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import PaginationControls from '@/components/Admin/PaginationControls.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { orderUpdateDTO } from '@/DTOs/admin/OrderUpdateDTO'
import type { ordersI } from '@/interfaces/admin/OrderInterface'
import OrderService from '@/services/admin/OrderService'
import Swal from 'sweetalert2'
import { computed, onMounted, ref } from 'vue'

const orderService = new OrderService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Órdenes' }])

const orders = ref<ordersI | null>(null)
const error = ref<string | null>(null)
const ordersList = computed(() => orders.value?.data ?? [])
const isLoading = ref(true)

// ✅ NUEVO: Estados de paginación
const currentPage = ref(1)
const perPage = ref(15)

// ✅ NUEVO: Función para calcular el índice global
const getGlobalIndex = (localIndex: number) => {
  return (currentPage.value - 1) * perPage.value + localIndex + 1
}

const loadOrders = async () => {
  try {
    isLoading.value = true
    orders.value = await orderService.getAll(currentPage.value, perPage.value)
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las órdenes.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// ✅ NUEVO: Handlers de paginación
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadOrders()
}

const handlePerPageChange = (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  loadOrders()
}

const handleDownloadPdf = async (orderId: string | number) => {
  try {
    // ✅ Mostrar loading mientras descarga
    useSweetAlert({
      title: 'Descargando...',
      text: 'Generando PDF',
      icon: 'loading',
    })

    const blob = await orderService.getPdf(orderId)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orden-${orderId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    // ✅ Cerrar el loading y mostrar éxito
    Swal.close()
    useSweetAlert({
      title: 'Descargado',
      text: 'PDF descargado exitosamente',
      icon: 'success',
      timer: 2000,
    })
  } catch (error) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudo descargar el PDF',
      icon: 'error',
      timer: 0,
    })
    console.error('Error descargando PDF:', error)
  }
}

// Función para actualizar el estado de la orden
const updateOrderStatus = async (
  orderId: number | string,
  status: orderUpdateDTO['status'],
  successMessage: string,
) => {
  try {
    isLoading.value = true
    await orderService.update({ status }, orderId)

    useSweetAlert({
      title: 'Actualizado',
      text: successMessage,
      icon: 'success',
    })

    // Recargar la lista
    await loadOrders()
  } catch (err) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudo actualizar el estado',
      icon: 'error',
      timer: 0,
    })
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Acciones específicas
const markAsProcessing = (orderId: number | string) => {
  updateOrderStatus(orderId, 'processing', 'La orden está siendo procesada')
}

const markAsRefunded = (orderId: number | string) => {
  updateOrderStatus(orderId, 'refunded', 'La orden ha sido reembolsada')
}

// Determinar qué acciones mostrar según el estado
const getAvailableActions = (status: string) => {
  switch (status) {
    case 'confirmed':
      return ['processing', 'refunded']
    case 'processing':
    case 'ready':
    case 'refunded':
    case 'completed':
    case 'cancelled':
      return []
    default:
      return []
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="ordersList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">N° Orden</th>
            <th scope="col" class="px-6 py-3">Tipo de Envío</th>
            <th scope="col" class="px-6 py-3">F. Orden</th>
            <th scope="col" class="px-6 py-3">Cliente</th>
            <th scope="col" class="px-6 py-3">Detalle</th>
            <th scope="col" class="px-6 py-3">Estado</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != ordersList.length - 1 ? 'border-b dark:border-gray-700 border-gray-200' : '',
            ]"
            v-for="(order, index) in ordersList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ getGlobalIndex(index) }}
            </th>
            <td class="px-6 py-4">
              {{ order.order_number }}
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  order.delivery_type === 'shipment'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800',
                ]"
              >
                {{ order.delivery_type === 'shipment' ? 'Envío' : 'Recojo' }}
              </span>
            </td>
            <td class="px-6 py-4">
              {{ order.date }}
            </td>
            <td class="px-6 py-4 max-w-40 truncate" :title="order.customer">
              {{ order.customer }}
            </td>
            <td class="px-6 py-4">
              <button
                class="cursor-pointer hover:opacity-80 transition"
                @click="handleDownloadPdf(order.id)"
              >
                <img :src="pdfSvg" alt="PDF" class="h-8 w-8" />
              </button>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  {
                    'bg-yellow-100 text-yellow-800': order.status_en === 'confirmed',
                    'bg-blue-100 text-blue-800': order.status_en === 'processing',
                    'bg-gray-100 text-gray-800': order.status_en === 'ready',
                    'bg-green-100 text-green-800': order.status_en === 'completed',
                    'bg-red-100 text-red-800': order.status_en === 'refunded',
                    'bg-red-200 text-red-700': order.status_en === 'cancelled',
                  },
                ]"
              >
                {{ order.status }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col space-y-2">
                <!-- Acciones según estado -->
                <template v-if="getAvailableActions(order.status_en).includes('processing')">
                  <button
                    @click="markAsProcessing(order.id)"
                    class="underline text-blue-300 hover:no-underline text-left text-sm cursor-pointer"
                  >
                    Alistar pedido
                  </button>
                </template>

                <template v-if="getAvailableActions(order.status_en).includes('refunded')">
                  <button
                    @click="markAsRefunded(order.id)"
                    class="underline text-red-500 hover:no-underline text-left text-sm cursor-pointer"
                  >
                    Reembolsar
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- ✅ NUEVO: Componente de paginación -->
    <PaginationControls
      v-if="orders?.meta"
      :meta="orders.meta"
      :per-page="perPage"
      @update:page="handlePageChange"
      @update:per-page="handlePerPageChange"
    />
  </div>
  <InfoAlert v-else message="Todavía no hay órdenes confirmadas" />
</template>
