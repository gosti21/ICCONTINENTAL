<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { districtCreateDTO } from '@/DTOs/admin/district/DistrictCreateDTO'
import type { generalI } from '@/interfaces/admin/address/generalnterface'
import { createDistrictSchema } from '@/schemas/admin/district/createDistrictValidationSchema'
import CountryService from '@/services/admin/CountryService'
import DepartmentService from '@/services/admin/DepartmentService'
import DistrictService from '@/services/admin/DistrictService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'

const countryService = new CountryService()
const departmentService = new DepartmentService()
const districtService = new DistrictService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Distritos', route: 'admin.address.districts' },
  { name: 'Crear' },
])

const countries = ref<generalI[]>([])
const departments = ref<generalI[]>([])
const provinces = ref<generalI[]>([])
const error = ref<string | null>(null)

const isLoading = ref(true)
const isDepartmentsLoading = ref(false)
const isProvincesLoading = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

const loadCountries = async () => {
  try {
    countries.value = await countryService.getAllList()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar los países.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const { meta, handleSubmit, errors, defineField, setErrors, resetField } = useForm({
  validationSchema: createDistrictSchema,
  initialValues: {
    country_id: '',
    department_id: '',
    province_id: '',
    name: '',
    delivery_price: '',
    min_delivery_days: '',
    max_delivery_days: '',
  },
})

const [countryId, countryIdAttrs] = defineField('country_id')
const [departmentId, departmentIdAttrs] = defineField('department_id')
const [provinceId, provinceIdAttrs] = defineField('province_id')
const [name, nameAttrs] = defineField('name')
const [deliveryPrice, deliveryPriceAttrs] = defineField('delivery_price')
const [minDeliveryDays, minDeliveryDaysAttrs] = defineField('min_delivery_days')
const [maxDeliveryDays, maxDeliveryDaysAttrs] = defineField('max_delivery_days')

// Watch para cargar departamentos al cambiar país
watch(countryId, async (newCountryId) => {
  departments.value = []
  provinces.value = []
  resetField('department_id')
  resetField('province_id')

  if (!newCountryId) return

  try {
    isDepartmentsLoading.value = true
    departments.value = await countryService.getAllDepartments(newCountryId)
  } catch (err) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar los departamentos',
      icon: 'error',
    })
    console.error(err)
  } finally {
    isDepartmentsLoading.value = false
  }
})

// Watch para cargar provincias al cambiar departamento
watch(departmentId, async (newDepartmentId) => {
  provinces.value = []
  resetField('province_id')

  if (!newDepartmentId) return

  try {
    isProvincesLoading.value = true
    provinces.value = await departmentService.getAllProvinces(newDepartmentId)
  } catch (err) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar las provincias',
      icon: 'error',
    })
    console.error(err)
  } finally {
    isProvincesLoading.value = false
  }
})

onMounted(async () => {
  loadCountries()
})

const onSubmit = handleSubmit(async (values, { resetForm }) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })
    const payload = {
      province_id: values.province_id,
      name: values.name,
      delivery_price: Number(values.delivery_price).toFixed(2),
      min_delivery_days: Number(values.min_delivery_days),
      max_delivery_days: Number(values.max_delivery_days),
    }
    await districtService.create(payload as districtCreateDTO)
    Swal.close()

    useSweetAlert({
      title: 'Distrito creado',
      text: 'El distrito ha sido creado con éxito',
      icon: 'success',
    })
    resetForm()
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
  <AnimationLoader v-if="isLoading" />
  <div
    v-else
    class="block p-5 border rounded-lg shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
  >
    <form @submit.prevent="onSubmit">
      <div class="mb-4">
        <label for="country_id" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Países
        </label>
        <select
          v-model="countryId"
          v-bind="countryIdAttrs"
          id="country_id"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
        >
          <option disabled value="">Selecciona un país</option>
          <option v-for="country in countries" :key="country.id" :value="country.id">
            {{ country.name }}
          </option>
        </select>
        <span v-if="errors.country_id" class="text-red-400">{{ errors.country_id }}</span>
      </div>

      <div class="mb-4">
        <label for="department_id" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Departamentos
        </label>
        <select
          v-model="departmentId"
          v-bind="departmentIdAttrs"
          id="department_id"
          :disabled="isDepartmentsLoading || !countryId"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
        >
          <option disabled value="">
            {{ isDepartmentsLoading ? 'Cargando...' : 'Selecciona un departamento' }}
          </option>
          <option v-for="department in departments" :key="department.id" :value="department.id">
            {{ department.name }}
          </option>
        </select>
        <span v-if="errors.department_id" class="text-red-400">{{ errors.department_id }}</span>
      </div>

      <div class="mb-4">
        <label for="province_id" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Provincias
        </label>
        <select
          v-model="provinceId"
          v-bind="provinceIdAttrs"
          id="province_id"
          :disabled="isProvincesLoading || !departmentId"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
        >
          <option disabled value="">
            {{ isProvincesLoading ? 'Cargando...' : 'Selecciona una provincia' }}
          </option>
          <option v-for="province in provinces" :key="province.id" :value="province.id">
            {{ province.name }}
          </option>
        </select>
        <span v-if="errors.province_id" class="text-red-400">{{ errors.province_id }}</span>
      </div>

      <div class="mb-4">
        <label for="name" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Nombre
        </label>
        <input
          v-model="name"
          v-bind="nameAttrs"
          id="name"
          type="text"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el nombre del distrito"
        />
        <span v-if="errors.name" class="text-red-400">{{ errors.name }}</span>
      </div>

      <div class="mb-4">
        <label for="delivery_price" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Precio de delivery
        </label>
        <input
          v-model="deliveryPrice"
          v-bind="deliveryPriceAttrs"
          id="delivery_price"
          type="number"
          step="0.01"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el precio de delivery: S/. 50.50"
        />
        <span class="text-red-400">{{ errors.delivery_price }}</span>
      </div>

      <div class="mb-4">
        <label
          for="min_delivery_days"
          class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
        >
          Día mínimo de envio
        </label>
        <input
          v-model="minDeliveryDays"
          v-bind="minDeliveryDaysAttrs"
          id="min_delivery_days"
          type="number"
          step="1"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el día mínimo de envío"
        />
        <span class="text-red-400">{{ errors.min_delivery_days }}</span>
      </div>

      <div class="mb-4">
        <label
          for="max_delivery_days"
          class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
        >
          Día máximo de envio
        </label>
        <input
          v-model="maxDeliveryDays"
          v-bind="maxDeliveryDaysAttrs"
          id="max_delivery_days"
          type="number"
          step="0.01"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el día máximo de envío"
        />
        <span class="text-red-400">{{ errors.max_delivery_days }}</span>
      </div>
      <div class="flex justify-end">
        <ButtonSave name="Guardar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
