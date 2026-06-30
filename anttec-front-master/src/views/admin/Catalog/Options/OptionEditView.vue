<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import { OPTION_TYPES } from '@/config/const/optionType'
import type { optionUpdateDTO } from '@/DTOs/admin/option/OptionUpdateDTO'
import type { OptionExtendI } from '@/interfaces/admin/options/OptionInterface'
import { editOptionSchema } from '@/schemas/admin/option/editOptionValidationScema'
import OptionService from '@/services/admin/OptionService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { Field, FieldArray, useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const optionService = new OptionService()

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const isLoading = ref(true)
const option = ref<OptionExtendI | null>(null)
const serverErrors = ref<Record<string, string[]>>({})

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Opciones', route: 'admin.catalog.options' },
  {
    name: option.value ? `Editar - ${option.value.name}` : 'Editar',
  },
])

const { meta, handleSubmit, errors, defineField, setErrors, resetForm, values } = useForm({
  validationSchema: editOptionSchema,
})

const [name, nameAttrs] = defineField('name')
const [type, typeAttrs] = defineField('type')

const loadOption = async () => {
  try {
    option.value = await optionService.getById(id)

    // 👉 CAMBIO 1: Mantener ID en cada option_value
    resetForm({
      values: {
        name: option.value.name,
        type: option.value.type,
        option_values: option.value?.option_values?.length
          ? option.value.option_values.map((spec) => ({
              id: spec.id, // <-- mantener ID
              value: spec.value,
              description: spec.description,
            }))
          : [{ id: null, value: '', description: '' }],
      },
    })
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadOption()
})

const onSubmit = handleSubmit(async (values) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })

    const payload = {
      name: values.name,
      option_values: values.option_values,
    }
    await optionService.update(payload as optionUpdateDTO, id)
    await loadOption()
    Swal.close()

    useSweetAlert({
      title: 'Producto actualizado',
      text: 'El producto ha sido actualizado con éxito',
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
        <label for="name" class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
          >Nombre</label
        >
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

      <div class="mb-4">
        <label for="name" class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
          >Tipo</label
        >
        <select
          v-model="type"
          v-bind="typeAttrs"
          id="type"
          disabled
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
        >
          <option disabled value="">Selecciona el tipo</option>
          <option disabled v-for="opt in OPTION_TYPES" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <span class="text-red-400">{{ errors.type }}</span>
      </div>

      <div class="mb-4">
        <section
          class="block border rounded-lg shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600"
        >
          <header class="border-b px-4 py-3 border-gray-300 dark:border-gray-500">
            <div class="flex justify-between">
              <h1 class="font-semibold text-gray-900 dark:text-white">Valores</h1>
            </div>
          </header>
          <div class="p-4">
            <span class="text-red-400">{{ errors.option_values }}</span>

            <FieldArray name="option_values" v-slot="{ fields, push, remove }">
              <fieldset v-for="(field, idx) in fields" :key="field.key">
                <div class="flex gap-6 mb-2 mt-2">
                  <!-- 👉 CAMBIO 2: Campo oculto para mantener el ID -->
                  <Field :name="`option_values[${idx}].id`" type="hidden" />

                  <div class="space-y-2 flex-1">
                    <label
                      :for="`value_${idx}`"
                      class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
                    >
                      Valor
                    </label>

                    <div
                      v-show="!type"
                      class="mb-1 border bg-gray-50 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-lg shadow-sm flex items-center justify-between p-2.5"
                    >
                      <p>Seleccione un tipo primero</p>
                    </div>

                    <div v-show="type === 'text'">
                      <Field
                        :id="`value_${idx}`"
                        :name="`option_values[${idx}].value`"
                        type="text"
                        validateOnInput
                        class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        placeholder="Ingrese una valor"
                      />
                    </div>

                    <div v-show="type === 'color'" class="flex items-center gap-2">
                      <div
                        class="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm h-11.5 flex items-center px-3 justify-between w-full"
                      >
                        <p class="text-gray-900 dark:text-gray-200">
                          {{ values.option_values[idx].value || 'Seleccione un color' }}
                        </p>
                        <Field
                          :id="`value_${idx}`"
                          :name="`option_values[${idx}].value`"
                          type="color"
                          class="focus:border-indigo-500 focus:ring-indigo-500 h-8 w-10 rounded-md cursor-pointer focus:outline-none focus:ring-1"
                        />
                      </div>
                    </div>

                    <span class="text-red-400">{{ errors[`option_values[${idx}].value`] }}</span>
                  </div>

                  <div class="flex-1">
                    <label
                      :for="`description_${idx}`"
                      class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
                    >
                      Descripción
                    </label>
                    <Field
                      :id="`description_${idx}`"
                      :name="`option_values[${idx}].description`"
                      type="text"
                      :disabled="!type"
                      validateOnInput
                      class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                      placeholder="Ingrese una descripción"
                    />
                    <span class="text-red-400">{{
                      errors[`option_values[${idx}].description`]
                    }}</span>
                  </div>
                  <!-- BOTÓN ELIMINAR SOLO PARA ITEMS NUEVOS -->
                  <div class="flex items-center">
                    <button
                      v-if="values.option_values[idx].id === null"
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
                </div>
              </fieldset>

              <div class="flex justify-end">
                <!-- 👉 CAMBIO 3: incluir id:null cuando se agrega -->
                <button
                  type="button"
                  class="mb-3 focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900"
                  @click="push({ id: null, value: '', description: '' })"
                >
                  Agregar
                </button>
              </div>
            </FieldArray>
          </div>
        </section>
      </div>

      <div class="flex justify-end">
        <ButtonSave name="Actualizar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
