<script setup lang="ts">
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { productOptionCreateDTO } from '@/DTOs/admin/productOption/ProductOptionCreateDTO'
import type { OptionI } from '@/interfaces/admin/options/OptionInterface'
import type { OptionValueShortI } from '@/interfaces/admin/options/OptionValueInterface'
import { createOptionProductSchema } from '@/schemas/admin/optionProduct/createOptionProductValidationSchema'
import OptionProductService from '@/services/admin/OptionProductService'
import OptionService from '@/services/admin/OptionService'
import axios from 'axios'
import { Modal, type ModalInterface } from 'flowbite'
import Swal from 'sweetalert2'
import { Field, FieldArray, useForm } from 'vee-validate'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const optionProductService = new OptionProductService()
const optionService = new OptionService()

const modalEl = ref<HTMLElement | null>(null)
let modal: ModalInterface | null = null

const options = ref<OptionI[]>([])
const optionValues = ref<OptionValueShortI[]>([])

const isLoading = ref(true)
const isOptionValuesLoading = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

const props = defineProps<{
  productId: number | string
}>()

const loadData = async () => {
  try {
    ;[options.value] = await Promise.all([optionService.getAllList()])
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const { meta, handleSubmit, errors, defineField, setErrors, setFieldValue } = useForm({
  validationSchema: createOptionProductSchema,
  initialValues: {
    option_id: '',
    values: [{ option_value_id: '' }],
  },
})

const [optionId, optionIdAttrs] = defineField('option_id')

watch(optionId, async (newOptionId) => {
  // resetear el FieldArray (valor + errores)
  setFieldValue('values', [{ option_value_id: '' }])

  if (!newOptionId) return

  try {
    isOptionValuesLoading.value = true
    optionValues.value = await optionService.getAllOptionValues(newOptionId)
  } catch (err) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar los valores de la opción',
      icon: 'error',
    })
    console.error(err)
  } finally {
    isOptionValuesLoading.value = false
  }
})

const emit = defineEmits<{
  (e: 'created'): void
}>()

onMounted(() => {
  if (!modalEl.value) return

  modal = new Modal(modalEl.value, {
    placement: 'center',
    backdrop: 'dynamic',
    closable: true,
  })

  loadData()
})

onUnmounted(() => {
  modal?.hide()
  modal = null
})

/* 👉 Métodos públicos */
const open = () => modal?.show()
const close = () => modal?.hide()

/* 👉 Exponer solo lo necesario */
defineExpose({
  open,
  close,
})

const onSubmit = handleSubmit(async (values, { resetForm }) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })
    const payload = {
      product_id: props.productId,
      option_id: values.option_id,
      values: values.values,
    }
    await optionProductService.create(payload as productOptionCreateDTO)
    Swal.close()

    useSweetAlert({
      title: 'Opcion Asociada',
      text: 'Se ha asociado con éxito',
      icon: 'success',
    })
    emit('created')
    resetForm()
    close()
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
  <div
    ref="modalEl"
    id="crud-modal"
    tabindex="-1"
    aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative p-4 w-full max-w-lg max-h-full">
      <!-- Modal content -->
      <div
        class="relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700"
      >
        <!-- Modal header -->
        <div
          class="flex items-center justify-between border-b border-default pb-4 md:pb-5 dark:border-gray-300"
        >
          <h3 class="text-lg font-medium text-heading dark:text-gray-100">
            Asociar nuevas opciones
          </h3>
        </div>
        <!-- Modal body -->
        <form action="" method="POST" @submit.prevent="onSubmit">
          <div class="mt-4 mb-6">
            <label for="option_id" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
              Opción
            </label>
            <select
              v-model="optionId"
              v-bind="optionIdAttrs"
              id="option_id"
              class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
            >
              <option disabled value="">Selecciona una opción</option>
              <option :value="option.id" v-for="(option, index) in options" :key="index">
                {{ option.name }}
              </option>
            </select>
            <span class="text-red-400">{{ errors.option_id }}</span>
          </div>
          <div class="flex items-center mb-4 dark:text-gray-200">
            <hr class="flex-1" />
            <span class="mx-6"> Valores </span>
            <hr class="flex-1" />
          </div>
          <div>
            <span class="text-red-400">{{ errors.values }}</span>
            <FieldArray name="values" v-slot="{ fields, push, remove }">
              <fieldset v-for="(field, idx) in fields" :key="field.key">
                <div class="mb-4">
                  <label
                    :for="`value_${idx}`"
                    class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
                  >
                    Valor
                  </label>
                  <div class="flex items-center gap-3">
                    <Field
                      :id="`value_${idx}`"
                      :name="`values[${idx}].option_value_id`"
                      as="select"
                      class="flex-1 w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
                      :disabled="isOptionValuesLoading || !optionId"
                    >
                      <option value="" disabled>
                        {{ isOptionValuesLoading ? 'Cargando...' : 'Selecciona un valor' }}
                      </option>
                      <option
                        :value="optionValue.id"
                        v-for="(optionValue, index) in optionValues"
                        :key="index"
                      >
                        {{ optionValue.description }}
                      </option>
                    </Field>
                    <button
                      v-if="fields.length > 1"
                      type="button"
                      @click="remove(idx)"
                      class="text-red-500 hover:text-red-700 font-semibold px-3 py-2"
                    >
                      <font-awesome-icon
                        icon="fa-solid fa-trash-can"
                        size="xl"
                        class="transition duration-75 group-hover:text-gray-900 dark:group-hover:text-white"
                      />
                    </button>
                  </div>
                  <span class="text-red-400">{{ errors[`values[${idx}].option_value_id`] }}</span>
                </div>
              </fieldset>
              <div class="flex justify-end">
                <button
                  type="button"
                  class="mb-3 focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-100 dark:hover:bg-gray-300 dark:focus:ring-gray-300 dark:text-black"
                  @click="push({ option_value_id: '' })"
                >
                  Agregar Valor
                </button>
              </div>
            </FieldArray>
          </div>
          <div class="flex items-center justify-end space-x-4 border-t border-default pt-4 md:pt-6">
            <button
              type="submit"
              :disabled="!meta.valid"
              class="cursor-pointer inline-flex items-center text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 uppercase tracking-widest focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none dark:bg-blue-600 disabled:opacity-50 transition ease-in-out duration-150"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
