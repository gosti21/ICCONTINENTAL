<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { subcategoryUpdateDTO } from '@/DTOs/admin/subcategory/SubcategoryUpdateDTO'
import type { categoryI } from '@/interfaces/admin/CategoryInterface'
import type { subcategoryI } from '@/interfaces/admin/SubcategoryInterface'
import { editSubcategorySchema } from '@/schemas/admin/subcategory/editSubcategoryValidationSchema'
import CategoryService from '@/services/admin/CategoryService'
import SubcategoryService from '@/services/admin/SubcategoryService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const categoryService = new CategoryService()
const subcategoryService = new SubcategoryService()

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})

const categories = ref<categoryI[] | null>(null)
const subcategory = ref<subcategoryI | null>(null)

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Subcategorías', route: 'admin.subcategories' },
  {
    name: subcategory.value ? `Editar - ${subcategory.value.name}` : 'Editar',
  },
])

const { meta, handleSubmit, errors, defineField, resetForm, setErrors } = useForm({
  validationSchema: editSubcategorySchema,
})
const [name, nameAttrs] = defineField('name')
const [categoryId, categoryIdAttrs] = defineField('category_id')

const loadSubcategories = async () => {
  try {
    const [subcategoryRes, categoriesRes] = await Promise.all([
      subcategoryService.getById(id),
      categoryService.getAllList(),
    ])

    subcategory.value = subcategoryRes
    categories.value = categoriesRes

    resetForm({
      values: {
        name: subcategory.value.name,
        category_id: subcategory.value.category_id,
      },
    })
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadSubcategories()
})

const onSubmit = handleSubmit(async (values) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })

    await subcategoryService.update(values as subcategoryUpdateDTO, id)
    Swal.close()
    useSweetAlert({
      title: 'Subcategoría actualizada',
      text: 'La subcategoría ha sido actualizada con éxito',
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
        <ButtonSave name="Actualizar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
