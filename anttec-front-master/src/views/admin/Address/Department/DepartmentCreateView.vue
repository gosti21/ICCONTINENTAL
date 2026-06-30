<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { departmentCreateDTO } from '@/DTOs/admin/department/DepartmentCreateDTO'
import type { generalI } from '@/interfaces/admin/address/generalnterface'
import { createDepartmentSchema } from '@/schemas/admin/department/createDepartmentValidationSchema'
import CountryService from '@/services/admin/CountryService'
import DepartmentService from '@/services/admin/DepartmentService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'

const countryService = new CountryService()
const departmentService = new DepartmentService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Departamentos', route: 'admin.address.departments' },
  { name: 'Crear' },
])

const countries = ref<generalI[] | null>(null)
const error = ref<string | null>(null)

const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})

const loadCountries = async () => {
  try {
    countries.value = await countryService.getAllList()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las categorías.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const { meta, handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: createDepartmentSchema,
  initialValues: {
    country_id: '',
    name: '',
  },
})
const [countryId, countryIdAttrs] = defineField('country_id')
const [name, nameAttrs] = defineField('name')

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

    await departmentService.create(values as departmentCreateDTO)
    Swal.close()

    useSweetAlert({
      title: 'Departamento creado',
      text: 'El departamento ha sido creado con éxito',
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
        <label for="name" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Nombre
        </label>
        <input
          v-model="name"
          v-bind="nameAttrs"
          id="name"
          type="text"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el nombre del departamento"
        />
        <span class="text-red-400">{{ errors.name }}</span>
      </div>
      <div class="flex justify-end">
        <ButtonSave name="Guardar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
