<script setup lang="ts">
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { addressCheckoutCreateDTO } from '@/DTOs/shop/address/AddressCheckoutCreateDTO'
import type { generalI } from '@/interfaces/admin/address/generalnterface'
import type { addressExtendSI } from '@/interfaces/shop/AddressExtendSInterface'
import { editCheckoutAddressSchema } from '@/schemas/shop/checkoutAddress/editCheckoutAddressSchema'
import axios from 'axios'
import { Modal, type ModalInterface } from 'flowbite'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

// ✅ Servicios directos (igual que en admin)
import AddressSService from '@/services/shop/AddressSService'
import LocationSService from '@/services/shop/LocationSService'

const addressService = new AddressSService()
const locationService = new LocationSService()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const modalEl = ref<HTMLElement | null>(null)
let modal: ModalInterface | null = null

// ✅ Estado local (igual que en admin)
const departments = ref<generalI[]>([])
const provinces = ref<generalI[]>([])
const districts = ref<generalI[]>([])
const address = ref<addressExtendSI | null>(null)

const isLoading = ref(true)
const isSubmitting = ref(false)
const isDepartmentsLoading = ref(false)
const isProvincesLoading = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

// ✅ Estados para controlar la carga inicial (IGUAL QUE EN ADMIN)
const isInitialLoad = ref(true)
const initialDataLoaded = ref(false)

const { meta, handleSubmit, errors, defineField, setErrors, resetField, resetForm } = useForm({
  validationSchema: editCheckoutAddressSchema,
})

const [departmentId, departmentIdAttrs] = defineField('department_id')
const [provinceId, provinceIdAttrs] = defineField('province_id')
const [districtId, districtIdAttrs] = defineField('district_id')
const [street, streetAttrs] = defineField('street')
const [streetNumber, streetNumberAttrs] = defineField('street_number')
const [reference, referenceAttrs] = defineField('reference')

// ✅ Función para cargar departamentos (igual que en admin)
const loadDepartmentsData = async (departmentIdValue: string | number) => {
  if (!departmentIdValue) {
    provinces.value = []
    return
  }

  try {
    isDepartmentsLoading.value = true
    provinces.value = await locationService.getAllProvinces(Number(departmentIdValue))
  } catch (err) {
    provinces.value = []
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar las provincias',
      icon: 'error',
    })
    console.error(err)
  } finally {
    isDepartmentsLoading.value = false
  }
}

// ✅ Función para cargar provincias (igual que en admin)
const loadProvincesData = async (provinceIdValue: string | number) => {
  if (!provinceIdValue) {
    districts.value = []
    return
  }

  try {
    isProvincesLoading.value = true
    districts.value = await locationService.getAllDistricts(Number(provinceIdValue))
  } catch (err) {
    districts.value = []
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar los distritos',
      icon: 'error',
    })
    console.error(err)
  } finally {
    isProvincesLoading.value = false
  }
}

// ✅ Watch optimizado EXACTAMENTE como en admin
watch(departmentId, async (newDepartmentId, oldDepartmentId) => {
  // Ignorar el primer cambio durante la carga inicial
  if (isInitialLoad.value) {
    return
  }

  // Si no hay departamento seleccionado, limpiar provincias y distritos
  if (!newDepartmentId) {
    provinces.value = []
    districts.value = []
    resetField('province_id', { value: '' })
    resetField('district_id', { value: '' })
    return
  }

  // Si cambió el departamento, resetear provincia y distrito, y cargar nuevas provincias
  if (newDepartmentId !== oldDepartmentId) {
    resetField('province_id', { value: '' })
    resetField('district_id', { value: '' })
    districts.value = []
    await loadDepartmentsData(newDepartmentId)
  }
})

// ✅ Watch optimizado EXACTAMENTE como en admin
watch(provinceId, async (newProvinceId, oldProvinceId) => {
  // Ignorar el primer cambio durante la carga inicial
  if (isInitialLoad.value) {
    return
  }

  // Si no hay provincia seleccionada, limpiar distritos
  if (!newProvinceId) {
    districts.value = []
    resetField('district_id', { value: '' })
    return
  }

  // Si cambió la provincia, resetear distrito y cargar nuevos distritos
  if (newProvinceId !== oldProvinceId) {
    resetField('district_id', { value: '' })
    await loadProvincesData(newProvinceId)
  }
})

// ✅ Función loadData EXACTAMENTE como en admin
const loadData = async (addressId: number) => {
  try {
    isLoading.value = true
    isInitialLoad.value = true

    // Primero obtenemos la dirección para saber qué departamento, provincia y distrito tiene
    const addressData = await addressService.getById(addressId)
    address.value = addressData

    // Ahora cargamos todo en paralelo incluyendo departamentos, provincias y distritos
    const promises = [locationService.getAllDepartments()]

    // Agregar la promesa de provincias si existe un departamento
    if (address.value?.department?.id) {
      promises.push(locationService.getAllProvinces(address.value.department.id))
    }

    // Agregar la promesa de distritos si existe una provincia
    if (address.value?.province?.id) {
      promises.push(locationService.getAllDistricts(address.value.province.id))
    }

    const results = await Promise.all(promises)

    departments.value = results[0]
    if (results[1]) {
      provinces.value = results[1]
    }
    if (results[2]) {
      districts.value = results[2]
    }

    // Esperar al siguiente tick para asegurar que el DOM esté actualizado
    await nextTick()

    // Establecer los valores del formulario
    resetForm({
      values: {
        department_id: address.value?.department?.id,
        province_id: address.value?.province?.id,
        district_id: address.value?.district?.id,
        street: address.value?.street,
        street_number: String(address.value?.street_number),
        reference: address.value?.reference || '',
      },
    })

    // Marcar que los datos iniciales se han cargado
    initialDataLoaded.value = true

    // Esperar un tick adicional antes de desactivar isInitialLoad
    await nextTick()
    isInitialLoad.value = false
  } catch (err) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudo cargar la información de la dirección',
      icon: 'error',
    })
    console.error(err)
    modal?.hide()
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
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

// ✅ Función open que llama a loadData
const open = async (addressId: number) => {
  modal?.show()
  await loadData(addressId)
}

const close = () => {
  modal?.hide()
  resetForm()
  address.value = null
  isLoading.value = true
  isInitialLoad.value = true
  initialDataLoaded.value = false
  provinces.value = []
  districts.value = []
  serverErrors.value = {}
  emit('close')
}

const onSubmit = handleSubmit(async (values) => {
  if (!address.value) return

  try {
    isSubmitting.value = true

    useSweetAlert({
      title: 'Enviando...',
      text: 'Actualizando dirección',
      icon: 'loading',
    })

    const payload: addressCheckoutCreateDTO = {
      district_id: Number(values.district_id),
      street: values.street,
      street_number: values.street_number,
      reference: values.reference || '',
    }

    await addressService.update(address.value.id, payload)

    Swal.close()

    useSweetAlert({
      title: '¡Éxito!',
      text: 'Dirección actualizada correctamente',
      icon: 'success',
    })

    emit('saved')
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
      title: 'Error',
      text: 'No se pudo actualizar la dirección. Verifica los datos e intenta de nuevo.',
      icon: 'error',
      timer: 0,
    })

    console.error('Error al actualizar dirección:', err)
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
          class="sticky top-0 z-10 bg-linear-to-r from-amber-600 to-orange-600 px-6 py-4 flex items-center justify-between rounded-t-2xl"
        >
          <h2 class="text-2xl font-bold text-white flex items-center gap-3">
            <font-awesome-icon icon="fa-solid fa-pen-to-square" />
            Editar dirección
          </h2>
          <button
            @click="close"
            type="button"
            class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-times" />
          </button>
        </div>

        <!-- Loading mientras carga la dirección -->
        <div v-if="isLoading" class="p-6 flex flex-col items-center justify-center min-h-100">
          <font-awesome-icon icon="fa-solid fa-spinner" spin class="text-5xl text-amber-600 mb-4" />
          <p class="text-gray-600 dark:text-gray-400">Cargando información de la dirección...</p>
        </div>

        <!-- Form -->
        <form
          v-else
          @submit.prevent="onSubmit"
          class="p-6 space-y-5 max-h-[calc(90vh-120px)] overflow-y-auto"
        >
          <!-- Departamento -->
          <div>
            <label
              for="edit_department_id"
              class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Departamento *
            </label>
            <select
              v-model="departmentId"
              v-bind="departmentIdAttrs"
              id="edit_department_id"
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
              for="edit_province_id"
              class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Provincia *
            </label>
            <select
              v-model="provinceId"
              v-bind="provinceIdAttrs"
              id="edit_province_id"
              :disabled="!departmentId || isDepartmentsLoading"
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
              for="edit_district_id"
              class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Distrito *
            </label>
            <select
              v-model="districtId"
              v-bind="districtIdAttrs"
              id="edit_district_id"
              :disabled="!provinceId || isProvincesLoading"
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
                for="edit_street"
                class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Calle / Avenida *
              </label>
              <input
                v-model="street"
                v-bind="streetAttrs"
                id="edit_street"
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
                for="edit_street_number"
                class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Número *
              </label>
              <input
                v-model="streetNumber"
                v-bind="streetNumberAttrs"
                id="edit_street_number"
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
              for="edit_reference"
              class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Referencia
            </label>
            <input
              v-model="reference"
              v-bind="referenceAttrs"
              id="edit_reference"
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
              :disabled="!meta.valid || isSubmitting"
              class="flex-1 px-6 py-3 bg-linear-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30 cursor-pointer"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                <font-awesome-icon icon="fa-solid fa-spinner" spin />
                Actualizando...
              </span>
              <span v-else> Guardar cambios </span>
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
  background: linear-gradient(180deg, rgb(251 146 60), rgb(249 115 22));
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgb(251 146 60), rgb(249 115 22));
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgb(249 115 22), rgb(234 88 12));
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgb(251 146 60) rgb(243 244 246);
}

.dark .overflow-y-auto {
  scrollbar-color: rgb(251 146 60) rgb(31 41 55);
}
</style>
