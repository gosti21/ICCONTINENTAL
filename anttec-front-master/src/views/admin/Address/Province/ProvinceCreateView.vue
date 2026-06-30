<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { provinceCreateDTO } from '@/DTOs/admin/province/ProvinceCreateDTO'
import type { generalI } from '@/interfaces/admin/address/generalnterface'
import { createProvinceSchema } from '@/schemas/admin/province/createProvinceValidationSchema'
import CountryService from '@/services/admin/CountryService'
import ProvinceService from '@/services/admin/ProvinceService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'

const countryService = new CountryService()
const provinceService = new ProvinceService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Provincias', route: 'admin.address.provinces' },
  { name: 'Crear' },
])

const countries = ref<generalI[]>([])
const departments = ref<generalI[]>([])
const error = ref<string | null>(null)

const isLoading = ref(true)
const isDepartmentsLoading = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

const loadCountries = async () => {
  try {
    countries.value = await countryService.getAllList()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar los paises.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const { meta, handleSubmit, errors, defineField, setErrors, resetField } = useForm({
  validationSchema: createProvinceSchema,
  initialValues: {
    country_id: '',
    department_id: '',
    name: '',
  },
})

const [countryId, countryIdAttrs] = defineField('country_id')
const [departmentId, departmentIdAttrs] = defineField('department_id')
const [name, nameAttrs] = defineField('name')

// Watch para actualizar subcategorías al cambiar categoría
watch(countryId, async (newCountryId) => {
  departments.value = [] // limpiar subcategorías
  resetField('department_id') // limpia valor y error sin marcar como tocado

  if (!newCountryId) return

  try {
    isDepartmentsLoading.value = true
    departments.value = await countryService.getAllDepartments(newCountryId)
  } catch (err) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar las subcategorías',
      icon: 'error',
    })
    console.error(err)
  } finally {
    isDepartmentsLoading.value = false
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
      department_id: values.department_id,
      name: values.name,
    }
    await provinceService.create(payload as provinceCreateDTO)
    Swal.close()

    useSweetAlert({
      title: 'Provincia creada',
      text: 'La provincia ha sido creado con éxito',
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
    <form action="" method="POST" @submit.prevent="onSubmit">
      <div class="mb-4">
        <label for="category_id" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Paises
        </label>
        <select
          v-model="countryId"
          v-bind="countryIdAttrs"
          id="category_id"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
        >
          <option disabled value="">Selecciona un país</option>
          <option :value="country.id" v-for="(country, index) in countries" :key="index">
            {{ country.name }}
          </option>
        </select>
        <span class="text-red-400">{{ errors.country_id }}</span>
      </div>

      <div class="mb-4">
        <label for="subcategory_id" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Departamentos
        </label>
        <select
          v-model="departmentId"
          v-bind="departmentIdAttrs"
          id="subcategory_id"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
          :disabled="isDepartmentsLoading || !countryId"
        >
          <option disabled value="">{{ isDepartmentsLoading ? 'Cargando...' : 'Selecciona un departamento' }}</option>
          <option :value="deparment.id" v-for="(deparment, index) in departments" :key="index">
            {{ deparment.name }}
          </option>
        </select>
        <span class="text-red-400">{{ errors.department_id }}</span>
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
          placeholder="Ingrese el nombre de la provincia"
        />
        <span class="text-red-400">{{ errors.name }}</span>
      </div>

      <div class="flex justify-end">
        <ButtonSave name="Guardar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
