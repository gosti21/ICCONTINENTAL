<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { provinceUpdateDTO } from '@/DTOs/admin/province/ProvinceUpdateDTO'
import type { generalI } from '@/interfaces/admin/address/generalnterface'
import type { provinceI } from '@/interfaces/admin/address/provinceInterface'
import { editDepartmentSchema } from '@/schemas/admin/department/editDepartmentValidationSchema'
import CountryService from '@/services/admin/CountryService'
import ProvinceService from '@/services/admin/ProvinceService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const countryService = new CountryService()
const provinceService = new ProvinceService()

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const isLoading = ref(true)
const isDepartmentsLoading = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

const countries = ref<generalI[]>([])
const departments = ref<generalI[]>([])
const province = ref<provinceI | null>(null)

// Estados para controlar la carga inicial
const isInitialLoad = ref(true)
const initialDataLoaded = ref(false)

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Departamentos', route: 'admin.address.provinces' },
  {
    name: province.value ? `Editar - ${province.value.name}` : 'Editar',
  },
])

const { meta, handleSubmit, errors, defineField, setErrors, resetField, resetForm } = useForm({
  validationSchema: editDepartmentSchema,
})

const [countryId, countryIdAttrs] = defineField('country_id')
const [departmentId, departmentIdAttrs] = defineField('department_id')
const [name, nameAttrs] = defineField('name')

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

// Watch optimizado para cambios de país
watch(countryId, async (newCountryId, oldCountryId) => {
  // Ignorar el primer cambio durante la carga inicial
  if (isInitialLoad.value) {
    return
  }

  // Si no hay país seleccionado, limpiar departamentos
  if (!newCountryId) {
    departments.value = []
    resetField('department_id', { value: '' })
    return
  }

  // Si cambió el país, resetear el departamento y cargar nuevos departamentos
  if (newCountryId !== oldCountryId) {
    resetField('department_id', { value: '' })
    await loadDepartments(newCountryId)
  }
})

const loadData = async () => {
  try {
    isLoading.value = true

    // Cargar países y provincia en paralelo
    const [countriesData, provinceData] = await Promise.all([
      countryService.getAllList(),
      provinceService.getById(id),
    ])

    countries.value = countriesData
    province.value = provinceData

    // Si la provincia tiene un país, cargar sus departamentos
    if (province.value?.country?.id) {
      await loadDepartments(province.value.country.id)
    }

    // Esperar al siguiente tick para asegurar que el DOM esté actualizado
    await nextTick()

    // Establecer los valores del formulario
    resetForm({
      values: {
        country_id: province.value?.country?.id ?? '',
        department_id: province.value?.department?.id ?? '',
        name: province.value?.name ?? '',
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

    const payload: provinceUpdateDTO = {
      department_id: values.department_id,
      name: values.name,
    }

    await provinceService.update(payload, id)
    Swal.close()

    useSweetAlert({
      title: 'Provincia actualizada',
      text: 'La provincia ha sido actualizada con éxito',
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
        <span v-if="errors.name" class="text-red-400">{{ errors.name }}</span>
      </div>

      <div class="flex justify-end">
        <ButtonSave name="Actualizar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
