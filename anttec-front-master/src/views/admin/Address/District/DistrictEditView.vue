<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { districtUpdateDTO } from '@/DTOs/admin/district/DistrictUpdateDTO'
import type { generalI } from '@/interfaces/admin/address/generalnterface'
import type { districtI } from '@/interfaces/admin/address/districtInterface'
import { editDistrictSchema } from '@/schemas/admin/district/editDistrictValidationSchema'
import CountryService from '@/services/admin/CountryService'
import DepartmentService from '@/services/admin/DepartmentService'
import DistrictService from '@/services/admin/DistrictService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const countryService = new CountryService()
const departmentService = new DepartmentService()
const districtService = new DistrictService()

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const isLoading = ref(true)
const isDepartmentsLoading = ref(false)
const isProvincesLoading = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

const countries = ref<generalI[]>([])
const departments = ref<generalI[]>([])
const provinces = ref<generalI[]>([])
const district = ref<districtI | null>(null)

// Estados para controlar la carga inicial
const isInitialLoad = ref(true)
const initialDataLoaded = ref(false)

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Distritos', route: 'admin.address.districts' },
  {
    name: district.value ? `Editar - ${district.value.name}` : 'Editar',
  },
])

const { meta, handleSubmit, errors, defineField, setErrors, resetField, resetForm } = useForm({
  validationSchema: editDistrictSchema,
})

const [countryId, countryIdAttrs] = defineField('country_id')
const [departmentId, departmentIdAttrs] = defineField('department_id')
const [provinceId, provinceIdAttrs] = defineField('province_id')
const [name, nameAttrs] = defineField('name')
const [deliveryPrice, deliveryPriceAttrs] = defineField('delivery_price')
const [minDeliveryDays, minDeliveryDaysAttrs] = defineField('min_delivery_days')
const [maxDeliveryDays, maxDeliveryDaysAttrs] = defineField('max_delivery_days')

// Función para cargar departamentos
const loadDepartments = async (countryIdValue: string | number) => {
  if (!countryIdValue) {
    departments.value = []
    return
  }

  try {
    isDepartmentsLoading.value = true
    departments.value = await countryService.getAllDepartments(countryIdValue)
  } catch (err) {
    departments.value = []
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar los departamentos',
      icon: 'error',
    })
    console.error(err)
  } finally {
    isDepartmentsLoading.value = false
  }
}

// Función para cargar provincias
const loadProvinces = async (departmentIdValue: string | number) => {
  if (!departmentIdValue) {
    provinces.value = []
    return
  }

  try {
    isProvincesLoading.value = true
    provinces.value = await departmentService.getAllProvinces(departmentIdValue)
  } catch (err) {
    provinces.value = []
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar las provincias',
      icon: 'error',
    })
    console.error(err)
  } finally {
    isProvincesLoading.value = false
  }
}

// Watch optimizado para cambios de país
watch(countryId, async (newCountryId, oldCountryId) => {
  // Ignorar el primer cambio durante la carga inicial
  if (isInitialLoad.value) {
    return
  }

  // Si no hay país seleccionado, limpiar departamentos y provincias
  if (!newCountryId) {
    departments.value = []
    provinces.value = []
    resetField('department_id', { value: '' })
    resetField('province_id', { value: '' })
    return
  }

  // Si cambió el país, resetear departamento y provincia, y cargar nuevos departamentos
  if (newCountryId !== oldCountryId) {
    resetField('department_id', { value: '' })
    resetField('province_id', { value: '' })
    provinces.value = []
    await loadDepartments(newCountryId)
  }
})

// Watch optimizado para cambios de departamento
watch(departmentId, async (newDepartmentId, oldDepartmentId) => {
  // Ignorar el primer cambio durante la carga inicial
  if (isInitialLoad.value) {
    return
  }

  // Si no hay departamento seleccionado, limpiar provincias
  if (!newDepartmentId) {
    provinces.value = []
    resetField('province_id', { value: '' })
    return
  }

  // Si cambió el departamento, resetear provincia y cargar nuevas provincias
  if (newDepartmentId !== oldDepartmentId) {
    resetField('province_id', { value: '' })
    await loadProvinces(newDepartmentId)
  }
})

const loadData = async () => {
  try {
    isLoading.value = true

    // Primero obtenemos el distrito para saber qué país, departamento y provincia tiene
    const districtData = await districtService.getById(id)
    district.value = districtData

    // Ahora cargamos todo en paralelo incluyendo departamentos y provincias
    const promises = [countryService.getAllList()]

    // Agregar la promesa de departamentos si existe un país
    if (district.value?.country?.id) {
      promises.push(countryService.getAllDepartments(district.value.country.id))
    }

    // Agregar la promesa de provincias si existe un departamento
    if (district.value?.department?.id) {
      promises.push(departmentService.getAllProvinces(district.value.department.id))
    }

    const results = await Promise.all(promises)

    countries.value = results[0]
    if (results[1]) {
      departments.value = results[1]
    }
    if (results[2]) {
      provinces.value = results[2]
    }

    // Esperar al siguiente tick para asegurar que el DOM esté actualizado
    await nextTick()

    // Establecer los valores del formulario
    resetForm({
      values: {
        country_id: district.value?.country?.id,
        department_id: district.value?.department?.id,
        province_id: district.value?.province?.id,
        name: district.value?.name,
        delivery_price: Number(district.value.shipping_rate.delivery_price).toFixed(2),
        min_delivery_days: district.value.shipping_rate.min_delivery_days,
        max_delivery_days: district.value.shipping_rate.max_delivery_days,
      },
    })

    // Marcar que los datos iniciales se han cargado
    initialDataLoaded.value = true

    // Esperar un tick adicional antes de desactivar isInitialLoad
    await nextTick()
    isInitialLoad.value = false
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})

const onSubmit = handleSubmit(async (values) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })

    const payload: districtUpdateDTO = {
      province_id: values.province_id,
      name: values.name,
      delivery_price: Number(values.delivery_price).toFixed(2),
      min_delivery_days: Number(values.min_delivery_days),
      max_delivery_days: Number(values.max_delivery_days),
    }

    await districtService.update(payload, id)
    Swal.close()

    useSweetAlert({
      title: 'Distrito actualizado',
      text: 'El distrito ha sido actualizado con éxito',
      icon: 'success',
    })
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
    console.error(err)
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
          :disabled="!countryId || isDepartmentsLoading"
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
          :disabled="!departmentId || isProvincesLoading"
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
        <span v-if="errors.delivery_price" class="text-red-400">{{ errors.delivery_price }}</span>
      </div>

      <div class="mb-4">
        <label
          for="min_delivery_days"
          class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
        >
          Día mínimo de envío
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
        <span v-if="errors.min_delivery_days" class="text-red-400">{{
          errors.min_delivery_days
        }}</span>
      </div>

      <div class="mb-4">
        <label
          for="max_delivery_days"
          class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
        >
          Día máximo de envío
        </label>
        <input
          v-model="maxDeliveryDays"
          v-bind="maxDeliveryDaysAttrs"
          id="max_delivery_days"
          type="number"
          step="1"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el día máximo de envío"
        />
        <span v-if="errors.max_delivery_days" class="text-red-400">{{
          errors.max_delivery_days
        }}</span>
      </div>

      <div class="flex justify-end">
        <ButtonSave name="Actualizar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
