<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { categoryUpdateDTO } from '@/DTOs/admin/category/CategoryUpdateDTO'
import type { categoryI } from '@/interfaces/admin/CategoryInterface'
import CategoryService from '@/services/admin/CategoryService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { editCategorySchema } from '../../../schemas/admin/category/editCategoryValidationSchema'

const categoryService = new CategoryService()

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const isLoading = ref(true)
const category = ref<categoryI | null>(null)
const serverErrors = ref<Record<string, string[]>>({})

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Categorías', route: 'admin.categories' },
  {
    name: category.value ? `Editar - ${category.value.name}` : 'Editar',
  },
])

const { meta, handleSubmit, errors, defineField, resetForm, setErrors } = useForm({
  validationSchema: editCategorySchema,
})
const [name, nameAttrs] = defineField('name')

const loadCategories = async () => {
  try {
    category.value = await categoryService.getById(id)
    resetForm({ values: { name: category.value.name } })
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadCategories()
})

const onSubmit = handleSubmit(async (values) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })

    await categoryService.update(values as categoryUpdateDTO, id)
    Swal.close()
    useSweetAlert({
      title: 'Categoría actualizada',
      text: 'La categoría ha sido actualizada con éxito',
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
        <label for="name" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Nombre
        </label>
        <input
          v-model="name"
          v-bind="nameAttrs"
          id="name"
          type="text"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el nombre de la categoría"
        />
        <span class="text-red-400">{{ errors.name }}</span>
      </div>
      <div class="flex justify-end">
        <ButtonSave name="Actualizar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
