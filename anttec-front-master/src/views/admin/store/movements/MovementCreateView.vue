<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import { REASON_BY_TYPE } from '@/config/const/movementReasonByType'
import { MOVEMENT_REASON_TYPES, type MovementReason } from '@/config/const/movementReasonType'
import { MOVEMENT_TYPES, type MovementType } from '@/config/const/movementType'
import type { movementCreateDTO } from '@/DTOs/admin/movement/MovementCreateDTO'
import type { branchVariantI } from '@/interfaces/admin/BranchVariantInterface'
import { createMovementSchema } from '@/schemas/admin/movement/createMovementValidationSchema'
import BranchVariantService from '@/services/admin/BranchVariantService'
import MovementsService from '@/services/admin/MovementsService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { Field, FieldArray, useForm } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'

const branchVariantService = new BranchVariantService()
const movementsService = new MovementsService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Movimientos', route: 'admin.store.movements' },
  { name: 'Crear' },
])

const variants = ref<branchVariantI[] | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})

const loadSubcategories = async () => {
  try {
    variants.value = await branchVariantService.getAllList()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las categorías.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const { meta, handleSubmit, errors, defineField, setErrors, setFieldValue } = useForm({
  validationSchema: createMovementSchema,
  initialValues: {
    type: '',
    detail_transaction: '',
    reason: '',
    variants: [{ branch_variant_id: '', quantity: '' }],
  },
})

const [type, typeAttrs] = defineField('type')
const [reason, reasonAttrs] = defineField('reason')
const [detailTransaction, detailTransactionAttrs] = defineField('detail_transaction')

onMounted(async () => {
  loadSubcategories()
})

const filteredReasons = computed(() => {
  if (!type.value) return []

  const allowed = REASON_BY_TYPE[type.value as keyof typeof REASON_BY_TYPE]

  return MOVEMENT_REASON_TYPES.filter((reason) => allowed.includes(reason.value))
})

watch(type, () => {
  if (!type.value) {
    setFieldValue('reason', '', false)
    return
  }

  const allowed = REASON_BY_TYPE[type.value as MovementType]

  if (!allowed.includes(reason.value as MovementReason)) {
    setFieldValue('reason', '', false)
  }
})

const onSubmit = handleSubmit(async (values, { resetForm }) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })
    await movementsService.create(values as movementCreateDTO)
    Swal.close()

    useSweetAlert({
      title: 'Movimiento registrado',
      text: 'El movimiento ha sido registrado con éxito',
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
        <label for="type" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Tipo
        </label>
        <select
          v-model="type"
          v-bind="typeAttrs"
          id="type"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
        >
          <option disabled value="">Selecciona el tipo</option>
          <option v-for="opt in MOVEMENT_TYPES" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <span class="text-red-400">{{ errors.type }}</span>
      </div>
      <div class="mb-4">
        <label for="reason" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Razon
        </label>
        <select
          v-model="reason"
          v-bind="reasonAttrs"
          id="reason"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
          :disabled="!type"
        >
          <option disabled value="">Selecciona la razón</option>
          <option v-for="opt in filteredReasons" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <span class="text-red-400">{{ errors.reason }}</span>
      </div>
      <div class="mb-4">
        <label for="description" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Detalle de transacción
        </label>
        <textarea
          v-model="detailTransaction"
          v-bind="detailTransactionAttrs"
          id="description"
          rows="2"
          class="block p-2.5 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese una descripción para el producto"
        ></textarea>
        <span class="text-red-400">{{ errors.detail_transaction }}</span>
      </div>
      <div class="mb-4">
        <section
          class="block border rounded-lg shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600"
        >
          <header class="border-b px-4 py-3 border-gray-300 dark:border-gray-500">
            <div class="flex justify-between">
              <h1 class="font-semibold text-gray-900 dark:text-white">Especificaciones</h1>
            </div>
          </header>
          <div class="p-4">
            <span class="text-red-400">{{ errors.variants }}</span>
            <FieldArray name="variants" v-slot="{ fields, push, remove }">
              <fieldset v-for="(field, idx) in fields" :key="field.key">
                <div class="flex gap-6 mb-2 mt-2">
                  <div class="space-y-2 flex-2">
                    <label
                      :for="`variant_${idx}`"
                      class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
                    >
                      Variante
                    </label>
                    <Field
                      :id="`variant_${idx}`"
                      :name="`variants[${idx}].branch_variant_id`"
                      as="select"
                      class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
                    >
                      <option disabled value="">Selecciona una especificación</option>
                      <option :value="variant.id" v-for="(variant, index) in variants" :key="index">
                        {{ variant.product.name }} ({{ variant.product.model }}) -
                        {{ variant.features.map((f) => f.description).join(' | ') }}
                      </option>
                    </Field>
                    <span class="text-red-400">{{
                      errors[`variants[${idx}].branch_variant_id`]
                    }}</span>
                  </div>
                  <div class="flex-1">
                    <label
                      :for="`quantity_${idx}`"
                      class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
                    >
                      Cantidad
                    </label>
                    <Field
                      :id="`quantity_${idx}`"
                      :name="`variants[${idx}].quantity`"
                      type="number"
                      validateOnInput
                      class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
                      placeholder="Ingrese la cantidad"
                    >
                    </Field>
                    <span class="text-red-400">{{ errors[`variants[${idx}].quantity`] }}</span>
                  </div>
                  <!-- BOTÓN ELIMINAR -->
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
              </fieldset>

              <div class="flex justify-end">
                <button
                  type="button"
                  class="mb-3 focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900"
                  @click="push({ branch_variant_id: '', quantity: '' })"
                >
                  Agregar
                </button>
              </div>
            </FieldArray>
          </div>
        </section>
      </div>
      <div class="flex justify-end">
        <ButtonSave name="Guardar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
