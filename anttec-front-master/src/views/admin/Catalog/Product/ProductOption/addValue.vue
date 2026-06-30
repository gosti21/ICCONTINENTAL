<script setup lang="ts">
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { addValuesDTO } from '@/DTOs/admin/productOption/addValuesDTO'
import type { OptionValueShortI } from '@/interfaces/admin/options/OptionValueInterface'
import { addValuesSchema } from '@/schemas/admin/optionProduct/AddValuesValidationSchema'
import OptionProductService from '@/services/admin/OptionProductService'
import OptionService from '@/services/admin/OptionService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'

const optionProductService = new OptionProductService()
const optionService = new OptionService()

const options = ref<OptionValueShortI[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const serverErrors = ref<Record<string, string[]>>({})

const props = defineProps<{
  option_id: number | string
  option_product: number | string
}>()

const emit = defineEmits<{
  (e: 'created'): void
}>()

const loadOption = async () => {
  try {
    options.value = await optionService.getAllOptionValues(props.option_id)
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las opciones.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadOption()
})

const { meta, handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: addValuesSchema,
  initialValues: {
    option_value_id: '',
  },
})

const [optionValueId, optionValueIdAttrs] = defineField('option_value_id')

const onSubmit = handleSubmit(async (values, { resetForm }) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })
    const payload = {
      option_product_id: props.option_product,
      option_value_id: values.option_value_id,
    }
    await optionProductService.addValues(payload as addValuesDTO)
    Swal.close()

    useSweetAlert({
      title: 'Opcion Asociada',
      text: 'Se ha asociado con éxito',
      icon: 'success',
    })
    emit('created')
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
  <form action="" method="POST" @submit.prevent="onSubmit" class="flex space-x-4">
    <div class="flex-1">
      <label for="option_id" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
        Valor:
      </label>
      <select
        v-model="optionValueId"
        v-bind="optionValueIdAttrs"
        id="option_id"
        class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
      >
        <option disabled value="">Selecciona una opción</option>
        <option :value="option.id" v-for="(option, index) in options" :key="index">
          {{ option.description }}
        </option>
      </select>
      <span class="text-red-400">{{ errors.option_value_id }}</span>
    </div>
    <div class="pt-10">
      <button
        class="cursor-pointer disabled:opacity-50 transition ease-in-out duration-150"
        type="submit"
        :disabled="!meta.valid"
      >
        <font-awesome-icon icon="fa-solid fa-circle-plus" size="2xl" class="text-amber-400" />
      </button>
    </div>
  </form>
</template>
