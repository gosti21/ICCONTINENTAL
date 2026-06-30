<script setup lang="ts">
import { useAddress } from '@/composables/useaddress'
import type { addressCheckoutCreateDTO } from '@/DTOs/shop/address/AddressCheckoutCreateDTO'
import type { addressSI } from '@/interfaces/shop/AddressSInterface'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Modal, type ModalInterface } from 'flowbite'
import { useForm } from 'vee-validate'
import { createCheckoutAddressSchema } from '@/schemas/shop/checkoutAddress/createCheckoutAddressSchema'
import { useSweetAlert } from '@/composables/useSweetAlert'
import axios from 'axios'
import Swal from 'sweetalert2'

const emit = defineEmits<{
  close: []
  saved: [address: addressSI]
}>()

const {
  departments,
  provinces,
  districts,
  isLoadingLocations,
  loadDepartments,
  loadProvinces,
  loadDistricts,
  createAddress,
} = useAddress()

const modalEl = ref<HTMLElement | null>(null)
let modal: ModalInterface | null = null

const isSubmitting = ref(false)
const isDepartmentsLoading = ref(false)
const isProvincesLoading = ref(false)

const { meta, handleSubmit, errors, defineField, setErrors, resetForm, resetField } = useForm({
  validationSchema: createCheckoutAddressSchema,
  initialValues: {
    department_id: '',
    province_id: '',
    district_id: '',
    street: '',
    street_number: '',
    reference: '',
  },
})

const [departmentId, departmentIdAttrs] = defineField('department_id')
const [provinceId, provinceIdAttrs] = defineField('province_id')
const [districtId, districtIdAttrs] = defineField('district_id')
const [street, streetAttrs] = defineField('street')
const [streetNumber, streetNumberAttrs] = defineField('street_number')
const [reference, referenceAttrs] = defineField('reference')

onMounted(async () => {
  await loadDepartments()

  if (!modalEl.value) return

  modal = new Modal(modalEl.value, {
    placement: 'center',
    backdrop: 'dynamic',
    closable: true,
  })
})

onUnmounted(() => {
  modal?.hide()
  modal = null
})

const open = () => {
  modal?.show()
}

const close = () => {
  modal?.hide()
  resetForm()
  emit('close')
}

watch(departmentId, async (newDepartmentId) => {
  provinces.value = []
  districts.value = []
  resetField('province_id')
  resetField('district_id')

  if (!newDepartmentId) return

  try {
    isDepartmentsLoading.value = true
    await loadProvinces(Number(newDepartmentId))
  } catch (err) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar las provincias',
      icon: 'error',
    })
    console.error(err)
  } finally {
    isDepartmentsLoading.value = false
  }
})

watch(provinceId, async (newProvinceId) => {
  districts.value = []
  resetField('district_id')

  if (!newProvinceId) return

  try {
    isProvincesLoading.value = true
    await loadDistricts(Number(newProvinceId))
  } catch (err) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar los distritos',
      icon: 'error',
    })
    console.error(err)
  } finally {
    isProvincesLoading.value = false
  }
})

const onSubmit = handleSubmit(async (values) => {
  try {
    isSubmitting.value = true

    useSweetAlert({
      title: 'Enviando...',
      text: 'Creando dirección',
      icon: 'loading',
    })

    const payload: addressCheckoutCreateDTO = {
      district_id: Number(values.district_id),
      street: values.street,
      street_number: values.street_number,
      reference: values.reference || '',
    }

    const savedAddress = await createAddress(payload)

    Swal.close()
    useSweetAlert({
      title: '¡Éxito!',
      text: 'Dirección creada correctamente',
      icon: 'success',
    })

    emit('saved', savedAddress)
    close()
  } catch (err) {
    Swal.close()

    if (axios.isAxiosError(err) && err.response?.status === 422) {
      const validationErrors = err.response.data.errors
      const veeValidateErrors: Record<string, string> = {}
      Object.keys(validationErrors).forEach((field) => {
        veeValidateErrors[field] = validationErrors[field][0]
      })
      setErrors(veeValidateErrors)
    }

    useSweetAlert({
      title: 'Error',
      text: 'No se pudo crear la dirección. Verifica los datos e intenta de nuevo.',
      icon: 'error',
      timer: 0,
    })

    console.error('Error al crear dirección:', err)
  } finally {
    isSubmitting.value = false
  }
})

defineExpose({
  open,
  close,
})
</script>

<template>
  <div
    ref="modalEl"
    tabindex="-1"
    aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative p-4 w-full max-w-2xl max-h-full">
      <div class="relative bg-white rounded-2xl shadow-2xl dark:bg-gray-800">
        <!-- Header -->
        <div
          class="sticky top-0 z-10 bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl"
        >
          <h2 class="text-2xl font-bold text-white flex items-center gap-3">
            <font-awesome-icon icon="fa-solid fa-location-dot" />
            Nueva dirección
          </h2>
          <button
            @click="close"
            type="button"
            class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-times" />
          </button>
        </div>

        <!-- Form -->
        <form @submit="onSubmit" class="p-6 space-y-5 max-h-[calc(90vh-120px)] overflow-y-auto">
          <!-- Departamento -->
          <div>
            <label
              for="department_id"
              class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Departamento *
            </label>
            <select
              v-model="departmentId"
              v-bind="departmentIdAttrs"
              id="department_id"
              :disabled="isLoadingLocations"
              class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
            >
              <option disabled value="">Seleccione un departamento</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
            <span v-if="errors.department_id" class="text-sm text-red-400 mt-1 block">
              {{ errors.department_id }}
            </span>
          </div>

          <!-- Provincia -->
          <div>
            <label
              for="province_id"
              class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Provincia *
            </label>
            <select
              v-model="provinceId"
              v-bind="provinceIdAttrs"
              id="province_id"
              :disabled="!departmentId || isDepartmentsLoading || isLoadingLocations"
              class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
            >
              <option disabled value="">
                {{ isDepartmentsLoading ? 'Cargando...' : 'Seleccione una provincia' }}
              </option>
              <option v-for="prov in provinces" :key="prov.id" :value="prov.id">
                {{ prov.name }}
              </option>
            </select>
            <span v-if="errors.province_id" class="text-sm text-red-400 mt-1 block">
              {{ errors.province_id }}
            </span>
          </div>

          <!-- Distrito -->
          <div>
            <label
              for="district_id"
              class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Distrito *
            </label>
            <select
              v-model="districtId"
              v-bind="districtIdAttrs"
              id="district_id"
              :disabled="!provinceId || isProvincesLoading || isLoadingLocations"
              class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
            >
              <option disabled value="">
                {{ isProvincesLoading ? 'Cargando...' : 'Seleccione un distrito' }}
              </option>
              <option v-for="dist in districts" :key="dist.id" :value="dist.id">
                {{ dist.name }}
              </option>
            </select>
            <span v-if="errors.district_id" class="text-sm text-red-400 mt-1 block">
              {{ errors.district_id }}
            </span>
          </div>

          <!-- Calle y Número -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                for="street"
                class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Calle / Avenida *
              </label>
              <input
                v-model="street"
                v-bind="streetAttrs"
                id="street"
                type="text"
                placeholder="Ej: Av. José Pardo"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
              />
              <span v-if="errors.street" class="text-sm text-red-400 mt-1 block">
                {{ errors.street }}
              </span>
            </div>

            <div>
              <label
                for="street_number"
                class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Número *
              </label>
              <input
                v-model="streetNumber"
                v-bind="streetNumberAttrs"
                id="street_number"
                type="text"
                placeholder="Ej: 123"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
              />
              <span v-if="errors.street_number" class="text-sm text-red-400 mt-1 block">
                {{ errors.street_number }}
              </span>
            </div>
          </div>

          <!-- Referencia -->
          <div>
            <label
              for="reference"
              class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Referencia
            </label>
            <input
              v-model="reference"
              v-bind="referenceAttrs"
              id="reference"
              type="text"
              placeholder="Ej: Casa blanca con puerta verde, cerca al parque"
              class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
            />
            <span v-if="errors.reference" class="text-sm text-red-400 mt-1 block">
              {{ errors.reference }}
            </span>
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="close"
              class="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="!meta.valid || isSubmitting || isLoadingLocations"
              class="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 cursor-pointer"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                <font-awesome-icon icon="fa-solid fa-spinner" spin />
                Guardando...
              </span>
              <span v-else> Agregar dirección </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 10px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgb(243 244 246);
  border-radius: 10px;
  margin: 8px 0;
}

.dark .overflow-y-auto::-webkit-scrollbar-track {
  background: rgb(31 41 55);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgb(59 130 246), rgb(99 102 241));
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgb(59 130 246), rgb(99 102 241));
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgb(37 99 235), rgb(79 70 229));
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgb(59 130 246) rgb(243 244 246);
}

.dark .overflow-y-auto {
  scrollbar-color: rgb(59 130 246) rgb(31 41 55);
}
</style>
