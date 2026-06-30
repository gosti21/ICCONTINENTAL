<script setup lang="ts">
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { shipmentsI, shipmentI } from '@/interfaces/admin/ShipmentInterface'
import type { shipmentUpdateDTO } from '@/DTOs/admin/ShipmentUpdateDTO'
import ShipmentService from '@/services/admin/ShipmentService'
import { computed, onMounted, ref } from 'vue'
import AssignCourierModal from './AssignCourierModal.vue'
import PaginationControls from '@/components/Admin/PaginationControls.vue'

const shipmentService = new ShipmentService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Envios' }])

const shipments = ref<shipmentsI | null>(null)
const error = ref<string | null>(null)
const shipmentsList = computed(() => shipments.value?.data ?? [])
const isLoading = ref(true)

// ✅ NUEVO: Estados de paginación
const currentPage = ref(1)
const perPage = ref(15)

// ✅ NUEVO: Función para calcular el índice global
const getGlobalIndex = (localIndex: number) => {
  return (currentPage.value - 1) * perPage.value + localIndex + 1
}

// Modal ref
const modalRef = ref<InstanceType<typeof AssignCourierModal> | null>(null)

const loadShipments = async () => {
  try {
    isLoading.value = true
    shipments.value = await shipmentService.getAll(currentPage.value, perPage.value)
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar los envíos.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// ✅ NUEVO: Handlers de paginación
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadShipments()
}

const handlePerPageChange = (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  loadShipments()
}

// Actualizar estado del shipment
const updateShipmentStatus = async (
  shipmentId: number | string,
  status: shipmentUpdateDTO['status'],
  successMessage: string
) => {
  try {
    isLoading.value = true
    await shipmentService.update({ status }, shipmentId)

    useSweetAlert({
      title: 'Actualizado',
      text: successMessage,
      icon: 'success',
    })

    await loadShipments()
  } catch (err) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudo actualizar el estado',
      icon: 'error',
      timer: 0
    })
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Acciones específicas para store_pickup
const markAsReadyForPickup = (shipmentId: number | string) => {
  updateShipmentStatus(shipmentId, 'ready_for_pickup', 'El pedido está listo para recoger')
}

const markAsPickedUp = (shipmentId: number | string) => {
  updateShipmentStatus(shipmentId, 'picked_up', 'El pedido ha sido recogido')
}

// Acciones para shipment
const openCourierModal = (shipmentId: number | string) => {
  modalRef.value?.open(shipmentId)
}

const markAsInTransit = (shipmentId: number | string) => {
  updateShipmentStatus(shipmentId, 'in_transit', 'El pedido está en camino')
}

const markAsDelivered = (shipmentId: number | string) => {
  updateShipmentStatus(shipmentId, 'delivered', 'El pedido ha sido entregado')
}

const markAsFailed = (shipmentId: number | string) => {
  updateShipmentStatus(shipmentId, 'failed', 'La entrega ha fallado')
}

const markAsReturned = (shipmentId: number | string) => {
  updateShipmentStatus(shipmentId, 'returned', 'El pedido ha sido devuelto')
}

// 👇 HELPER: Normalizar delivery_type
const normalizeDeliveryType = (deliveryType: string): 'store_pickup' | 'shipment' | 'unknown' => {
  const normalized = deliveryType.toLowerCase().trim()

  if (normalized.includes('recojo') || normalized.includes('tienda') || normalized === 'store_pickup') {
    return 'store_pickup'
  }

  if (normalized.includes('envío') || normalized.includes('envio') || normalized === 'shipment') {
    return 'shipment'
  }

  return 'unknown'
}

// Determinar acciones disponibles según estado y tipo de entrega
const getAvailableActions = (shipment: shipmentI): string[] => {
  const status = shipment.status_en
  const deliveryType = normalizeDeliveryType(shipment.delivery_type)

  // Para recojo en tienda
  if (deliveryType === 'store_pickup') {
    switch (status) {
      case 'preparing':
        return ['ready_for_pickup']
      case 'ready_for_pickup':
        return ['picked_up']
      case 'picked_up':
        return []
      default:
        return []
    }
  }

  // Para envío a domicilio
  if (deliveryType === 'shipment') {
    switch (status) {
      case 'preparing':
        return ['dispatched']
      case 'dispatched':
        return ['in_transit']
      case 'in_transit':
        return ['delivered', 'failed']
      case 'delivered':
        return []
      case 'failed':
        return ['returned', 'in_transit']
      case 'returned':
        return []
      default:
        return []
    }
  }

  return []
}

onMounted(() => {
  loadShipments()
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="shipmentsList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">N° Orden</th>
            <th scope="col" class="px-6 py-3">N° Envio</th>
            <th scope="col" class="px-6 py-3">Courier</th>
            <th scope="col" class="px-6 py-3">Tipo de Envío</th>
            <th scope="col" class="px-6 py-3">Costo de Envío</th>
            <th scope="col" class="px-6 py-3">Estado</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != shipmentsList.length - 1 ? 'border-b dark:border-gray-700 border-gray-200' : '',
            ]"
            v-for="(shipment, index) in shipmentsList"
            :key="shipment.id"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ getGlobalIndex(index) }}
            </th>
            <td class="px-6 py-4">
              {{ shipment.order_number }}
            </td>
            <td class="px-6 py-4">
              {{ shipment.tracking_number !== '-' ? shipment.tracking_number : 'N/A' }}
            </td>
            <td class="px-6 py-4 max-w-40 truncate" :title="shipment.shippingCompany">
              {{ shipment.shippingCompany !== '-' ? shipment.shippingCompany : 'N/A' }}
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  normalizeDeliveryType(shipment.delivery_type) === 'shipment'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                ]"
              >
                {{ shipment.delivery_type }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-200 font-medium">
              S/. {{ shipment.shipment_cost }}
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  {
                    'bg-yellow-100 text-yellow-800': ['pending', 'preparing'].includes(shipment.status_en),
                    'bg-blue-100 text-blue-800': ['dispatched', 'in_transit', 'ready_for_pickup'].includes(shipment.status_en),
                    'bg-green-100 text-green-800': ['delivered', 'picked_up'].includes(shipment.status_en),
                    'bg-red-100 text-red-800': shipment.status_en === 'failed',
                    'bg-red-200 text-red-700': shipment.status_en === 'cancelled',
                    'bg-gray-100 text-gray-800': shipment.status_en === 'returned',
                  }
                ]"
              >
                {{ shipment.status }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col space-y-2">
                <!-- ACCIONES PARA STORE PICKUP -->
                <template v-if="normalizeDeliveryType(shipment.delivery_type) === 'store_pickup'">
                  <button
                    v-if="getAvailableActions(shipment).includes('ready_for_pickup')"
                    @click="markAsReadyForPickup(shipment.id)"
                    class="underline text-blue-400 hover:no-underline text-left text-sm cursor-pointer"
                  >
                    Marcar listo para recoger
                  </button>

                  <button
                    v-if="getAvailableActions(shipment).includes('picked_up')"
                    @click="markAsPickedUp(shipment.id)"
                    class="underline text-green-500 hover:no-underline text-left text-sm cursor-pointer"
                  >
                    Marcar como recogido
                  </button>
                </template>

                <!-- ACCIONES PARA SHIPMENT -->
                <template v-if="normalizeDeliveryType(shipment.delivery_type) === 'shipment'">
                  <button
                    v-if="getAvailableActions(shipment).includes('dispatched')"
                    @click="openCourierModal(shipment.id)"
                    class="underline text-blue-400 hover:no-underline text-left text-sm cursor-pointer"
                  >
                    Asignar courier y despachar
                  </button>

                  <button
                    v-if="getAvailableActions(shipment).includes('in_transit')"
                    @click="markAsInTransit(shipment.id)"
                    class="underline text-blue-400 hover:no-underline text-left text-sm cursor-pointer"
                  >
                    Marcar en tránsito
                  </button>

                  <button
                    v-if="getAvailableActions(shipment).includes('delivered')"
                    @click="markAsDelivered(shipment.id)"
                    class="underline text-green-500 hover:no-underline text-left text-sm cursor-pointer"
                  >
                    Marcar como entregado
                  </button>

                  <button
                    v-if="getAvailableActions(shipment).includes('failed')"
                    @click="markAsFailed(shipment.id)"
                    class="underline text-red-500 hover:no-underline text-left text-sm cursor-pointer"
                  >
                    Marcar como fallido
                  </button>

                  <button
                    v-if="getAvailableActions(shipment).includes('returned')"
                    @click="markAsReturned(shipment.id)"
                    class="underline text-orange-500 hover:no-underline text-left text-sm cursor-pointer"
                  >
                    Marcar como devuelto
                  </button>
                </template>

                <!-- Mensaje cuando no hay acciones -->
                <span
                  v-if="getAvailableActions(shipment).length === 0"
                  class="text-md text-gray-400 italic"
                >
                  Sin acciones disponibles
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <PaginationControls
      v-if="shipments?.meta"
      :meta="shipments.meta"
      :per-page="perPage"
      @update:page="handlePageChange"
      @update:per-page="handlePerPageChange"
    />
    <!-- Modal para asignar courier -->
    <AssignCourierModal ref="modalRef" @updated="loadShipments" />
  </div>
  <InfoAlert v-else message="Todavía no hay envíos confirmados" />
</template>
