<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { subcategoryCreateDTO } from '@/DTOs/admin/subcategory/SubcategoryCreateDTO'
import type { categoryI } from '@/interfaces/admin/CategoryInterface'
import CategoryService from '@/services/admin/CategoryService'
import SubcategoryService from '@/services/admin/SubcategoryService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { createSubcategorySchema } from '../../../schemas/admin/subcategory/createSubcategoryValidationSchema'

const categoryService = new CategoryService()
const subcategoryService = new SubcategoryService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Subcategorías', route: 'admin.subcategories' },
  { name: 'Crear' },
])

const categories = ref<categoryI[] | null>(null)
const error = ref<string | null>(null)

const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})

const loadSubcategories = async () => {
  try {
    categories.value = await categoryService.getAllList()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las categorías.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const { meta, handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: createSubcategorySchema,
  initialValues: {
    category_id: '',
    name: '',
  },
})
const [name, nameAttrs] = defineField('name')
const [categoryId, categoryIdAttrs] = defineField('category_id')

onMounted(async () => {
  loadSubcategories()
})

const onSubmit = handleSubmit(async (values, { resetForm }) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })

    await subcategoryService.create(values as subcategoryCreateDTO)
    Swal.close()

    useSweetAlert({
      title: 'Subcategoría creada',
      text: 'La subcategoría ha sido creada con éxito',
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
          Categorias
        </label>
        <select
          v-model="categoryId"
          v-bind="categoryIdAttrs"
          id="category_id"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
        >
          <option disabled value="">Selecciona una categoría</option>
          <option :value="category.id" v-for="(category, index) in categories" :key="index">
            {{ category.name }}
          </option>
        </select>
        <span class="text-red-400">{{ errors.category_id }}</span>
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
          placeholder="Ingrese el nombre de la subcategoría"
        />
        <span class="text-red-400">{{ errors.name }}</span>
      </div>
      <div class="flex justify-end">
        <ButtonSave name="Guardar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
