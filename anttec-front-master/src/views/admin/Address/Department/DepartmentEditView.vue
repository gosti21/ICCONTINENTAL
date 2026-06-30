<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { departmentUpdateDTO } from '@/DTOs/admin/department/DepartmentUpdateDTO'
import type { departmentI } from '@/interfaces/admin/address/departmentInterface'
import type { generalI } from '@/interfaces/admin/address/generalnterface'
import { editDepartmentSchema } from '@/schemas/admin/department/editDepartmentValidationSchema'
import CountryService from '@/services/admin/CountryService'
import DepartmentService from '@/services/admin/DepartmentService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const countryService = new CountryService()
const departmentService = new DepartmentService()

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})

const countries = ref<generalI[] | null>(null)
const deparment = ref<departmentI | null>(null)

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Departamentos', route: 'admin.address.departments' },
  {
    name: deparment.value ? `Editar - ${deparment.value.name}` : 'Editar',
  },
])

const { meta, handleSubmit, errors, defineField, resetForm, setErrors } = useForm({
  validationSchema: editDepartmentSchema,
})
const [countryId, countryIdAttrs] = defineField('country_id')
const [name, nameAttrs] = defineField('name')

const loadData = async () => {
  try {
    const [deparmentRes, countryRes] = await Promise.all([
      departmentService.getById(id),
      countryService.getAllList(),
    ])

    deparment.value = deparmentRes
    countries.value = countryRes

    resetForm({
      values: {
        name: deparment.value.name,
        country_id: deparment.value.country.id,
      },
    })
  } catch (error) {
    console.error(error)
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

    await departmentService.update(values as departmentUpdateDTO, id)
    Swal.close()
    useSweetAlert({
      title: 'Departamento actualizada',
      text: 'El departamento ha sido actualizada con éxito',
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
        <ButtonSave name="Actualizar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
