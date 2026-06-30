<script setup lang="ts">
import AnimationLoader from '@/components/AnimationLoader.vue'
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { createBrandSchema } from '@/schemas/admin/brand/createBrandValidationSchema'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { useSweetAlert } from '@/composables/useSweetAlert'
import Swal from 'sweetalert2'
import BrandService from '@/services/admin/BrandService'
import type { brandCreateDTO } from '@/DTOs/admin/brand/BrandCreateDTO'
import axios from 'axios'

const brandService = new BrandService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Marcas', route: 'admin.brands' },
  { name: 'Crear' },
])

const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})

const { meta, handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: createBrandSchema,
})
const [name, nameAttrs] = defineField('name')

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  isLoading.value = false
})

const onSubmit = handleSubmit(async (values, { resetForm }) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })

    await brandService.create(values as brandCreateDTO)
    Swal.close()

    useSweetAlert({
      title: 'Marca creada',
      text: 'La marca ha sido creada con éxito',
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
        <label for="name" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Nombre
        </label>
        <input
          v-model="name"
          v-bind="nameAttrs"
          id="name"
          type="text"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el nombre de la marca"
        />
        <span class="text-red-400">{{ errors.name }}</span>
      </div>
      <div class="flex justify-end">
        <ButtonSave name="Guardar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
