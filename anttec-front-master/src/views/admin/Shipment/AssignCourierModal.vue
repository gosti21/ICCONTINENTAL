<script setup lang="ts">
import { useSweetAlert } from '@/composables/useSweetAlert'
import ShipmentService from '@/services/admin/ShipmentService'
import axios from 'axios'
import { Modal, type ModalInterface } from 'flowbite'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, onUnmounted, ref } from 'vue'
import { shipmentSchema } from '@/schemas/admin/ShipmentSchemaValidate'
import CourierService from '@/services/admin/CourierService'
import type { courierI } from '@/interfaces/admin/CourierInterface'
import type { shipmentUpdateDTO } from '@/DTOs/admin/ShipmentUpdateDTO'

const shipmentService = new ShipmentService()
const shippingCompanyService = new CourierService()

const modalEl = ref<HTMLElement | null>(null)
let modal: ModalInterface | null = null

const shippingCompanies = ref<courierI[]>([])
const currentShipmentId = ref<number | string | null>(null)
const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})

const { meta, handleSubmit, errors, defineField, setErrors, resetForm } = useForm({
  validationSchema: shipmentSchema,
  initialValues: {
    shipping_company_id: '',
    tracking_number: '',
  },
})

const [shippingCompanyId, shippingCompanyIdAttrs] = defineField('shipping_company_id')
const [trackingNumber, trackingNumberAttrs] = defineField('tracking_number')

const loadShippingCompanies = async () => {
  try {
    shippingCompanies.value = await shippingCompanyService.getAllList()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const emit = defineEmits<{
  (e: 'updated'): void
}>()

onMounted(() => {
  if (!modalEl.value) return

  modal = new Modal(modalEl.value, {
    placement: 'center',
    backdrop: 'dynamic',
    closable: true,
  })

  loadShippingCompanies()
})

onUnmounted(() => {
  modal?.hide()
  modal = null
})

const open = (shipmentId: number | string) => {
  currentShipmentId.value = shipmentId
  resetForm()
  modal?.show()
}

const close = () => {
  modal?.hide()
  currentShipmentId.value = null
}

defineExpose({
  open,
  close,
})

const onSubmit = handleSubmit(async (values) => {
  if (!currentShipmentId.value) return

  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Asignando courier',
      icon: 'loading',
    })

    const payload: shipmentUpdateDTO = {
      shipping_company_id: Number(values.shipping_company_id),
      tracking_number: values.tracking_number,
      status: 'dispatched'
    }

    await shipmentService.update(payload, currentShipmentId.value.toString())

    Swal.close()
    useSweetAlert({
      title: 'Despachado',
      text: 'El envío ha sido asignado y despachado',
      icon: 'success',
    })

    emit('updated')
    resetForm()
    close()
  } catch (err) {
    Swal.close()
    if (axios.isAxiosError(err) && err.response?.status === 422) {
      const validationErrors = err.response.data.errors
      serverErrors.value = validationErrors
      const veeValidateErrors: Record<string, string> = {}
      Object.keys(validationErrors).forEach((field) => {
        veeValidateErrors[field] = validationErrors[field][0]
      })
      setErrors(veeValidateErrors)
    }
    useSweetAlert({
      title: 'Algo salió mal',
      text: 'Verifica los datos e intenta de nuevo',
      icon: 'error',
      timer: 0,
    })
  }
})
</script>

<template>
  <div
    ref="modalEl"
    id="assign-courier-modal"
    tabindex="-1"
    aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative p-4 w-full max-w-lg max-h-full">
      <div
        class="relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700"
      >
        <div
          class="flex items-center justify-between border-b border-default pb-4 md:pb-5 dark:border-gray-300"
        >
          <h3 class="text-lg font-medium text-heading dark:text-gray-100">
            Asignar Courier y Despachar
          </h3>
        </div>

        <form @submit.prevent="onSubmit">
          <div class="mt-4 mb-4">
            <label for="shipping_company_id" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
              Empresa de Courier
            </label>
            <select
              v-model="shippingCompanyId"
              v-bind="shippingCompanyIdAttrs"
              id="shipping_company_id"
              class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
            >
              <option disabled value="">Selecciona un courier</option>
              <option
                :value="company.id"
                v-for="company in shippingCompanies"
                :key="company.id"
              >
                {{ company.name }}
              </option>
            </select>
            <span class="text-red-400 text-sm">{{ errors.shipping_company_id }}</span>
          </div>

          <div class="mb-6">
            <label for="tracking_number" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
              Número de Seguimiento
            </label>
            <input
              v-model="trackingNumber"
              v-bind="trackingNumberAttrs"
              type="text"
              id="tracking_number"
              placeholder="Ej: TRK123456789"
              class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:outline-none focus:ring-1"
            />
            <span class="text-red-400 text-sm">{{ errors.tracking_number }}</span>
          </div>

          <div class="flex items-center justify-end space-x-4 border-t border-default pt-4 md:pt-6">
            <button
              type="button"
              @click="close"
              class="text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="!meta.valid"
              class="inline-flex items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Despachar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
