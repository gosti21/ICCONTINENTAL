<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { OptionProductValuesI } from '@/interfaces/admin/optionProduct/OptionProductValuesInterface'
import type { ProductOptionListI } from '@/interfaces/admin/product/ProductOptionListInterface'
import { createVariantSchema } from '@/schemas/admin/variant/createVariantValidationSchema'
import OptionProductService from '@/services/admin/OptionProductService'
import ProductService from '@/services/admin/ProductService'
import VariantService from '@/services/admin/VariantService'
import axios from 'axios'
import type { FilePondFile, FilePond as FilePondInstance } from 'filepond'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import 'filepond/dist/filepond.min.css'
import Swal from 'sweetalert2'
import { Field, useField, useFieldArray, useForm } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import vueFilePond from 'vue-filepond'
import { useRoute } from 'vue-router'

const productService = new ProductService()
const variantService = new VariantService()
const optionProductService = new OptionProductService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Productos', route: 'admin.catalog.products' },
  { name: 'Detalle', route: 'admin.catalog.products.show' },
  { name: 'Crear Variante' },
])

const formKey = ref(0)
const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

interface VariantForm {
  selling_price: number | string
  purcharse_price: number | string
  stock_min: number | string
  images: { image: File | Blob }[]
  features: Feature[]
}

interface Feature {
  option_product_id: number | string
  option_product_value_id: number | string
}

const hasOptions = ref<string | null>(null)
const options = ref<ProductOptionListI[]>([])
const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})
const error = ref<string | null>(null)
const valuesMap = ref<Record<number, OptionProductValuesI[]>>({})
const loadingMap = ref<Record<number, boolean>>({})
const filePondRef = ref<FilePondInstance | null>(null)

const loadData = async () => {
  try {
    const [optionsList, optionsStatus] = await Promise.all([
      productService.getAllOptionsList(id),
      productService.hasOptions(id),
    ])
    options.value = optionsList
    hasOptions.value = optionsStatus
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las opciones.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const { meta, handleSubmit, errors, setFieldValue, defineField, setErrors, resetField } =
  useForm<VariantForm>({
    validationSchema: createVariantSchema,
    initialValues: {
      selling_price: '',
      purcharse_price: '',
      stock_min: '',
      images: [],
      features: [{ option_product_id: '', option_product_value_id: '' }],
    },
  })

const [purcharsePrice, purcharsePriceAttrs] = defineField('purcharse_price')
const [sellingPrice, sellingPriceAttrs] = defineField('selling_price')
const [stockMin, stockMinAttrs] = defineField('stock_min')
const { fields: featureFields, push, remove } = useFieldArray<Feature>('features')
//evitar el error de validacion
const {
  errorMessage: imagesError,
  meta: imagesMeta,
  setTouched: setImagesTouched,
} = useField('images')

const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginImageExifOrientation,
  FilePondPluginFileValidateSize,
  FilePondPluginFileValidateType,
)

watch(
  () => featureFields.value.map((f) => (f.value as Feature).option_product_id),
  async (newOptionIds, oldOptionIds) => {
    newOptionIds.forEach(async (optionId, idx) => {
      if (optionId === oldOptionIds?.[idx]) return

      // reset value seleccionada
      featureFields.value[idx].value.option_product_value_id = ''

      if (!optionId) {
        valuesMap.value[idx] = []
        return
      }

      try {
        loadingMap.value[idx] = true
        valuesMap.value[idx] = await optionProductService.getAllValues(id, optionId)
      } catch (e) {
        useSweetAlert({
          title: 'Error',
          text: 'No se pudieron cargar los valores',
          icon: 'error',
        })
        console.log(e)
      } finally {
        loadingMap.value[idx] = false
      }
    })
  },
  { deep: true },
)

const onUpdateFiles = (files: FilePondFile[]) => {
  if (files.length > 0) {
    setImagesTouched(true) // ✅ solo cuando hay interacción real
  }

  setFieldValue(
    'images',
    files.map((file) => ({
      image: file.file,
    })),
  )
}

const onSubmit = handleSubmit(async (values, { resetForm }) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })
    const formData = new FormData()

    formData.append('selling_price', String(values.selling_price))
    formData.append('purcharse_price', String(values.purcharse_price))
    formData.append('stock_min', String(values.stock_min))
    formData.append('product_id', String(id))

    // features[]
    values.features.forEach((feature, index) => {
      formData.append(
        `features[${index}][option_product_value]`,
        String(feature.option_product_value_id),
      )
    })

    // images[]
    values.images.forEach((img, index) => {
      formData.append(`images[${index}][image]`, img.image)
    })
    await variantService.create(formData)
    Swal.close()

    useSweetAlert({
      title: 'Producto creado',
      text: 'El producto ha sido creado con éxito',
      icon: 'success',
    })
    resetForm()
    resetField('images') // 🔥 ESTA ES LA CLAVE
    filePondRef.value?.removeFiles()
    formKey.value++
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

onMounted(async () => {
  loadData()
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <div v-else>
    <div v-if="hasOptions === 'Tiene opciones'">
      <form action="" method="POST" @submit.prevent="onSubmit" :key="formKey">
        <div class="flex items-center mb-6 dark:text-gray-300 text-gray-800">
          <hr class="flex-1" />
          <span class="mx-4"> Datos de la variante </span>
          <hr class="flex-1" />
        </div>
        <div class="mb-4">
          <label
            for="purcharse_price"
            class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
          >
            Precio de compra
          </label>
          <input
            v-model="purcharsePrice"
            v-bind="purcharsePriceAttrs"
            id="purcharse_price"
            type="number"
            step="0.01"
            class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
            placeholder="Ingrese el precio de compra: S/. 50.50"
          />
          <span class="text-red-400">{{ errors.purcharse_price }}</span>
        </div>
        <div class="mb-4">
          <label
            for="selling_price"
            class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
          >
            Precio de venta
          </label>
          <input
            v-model="sellingPrice"
            v-bind="sellingPriceAttrs"
            id="selling_price"
            type="number"
            step="0.01"
            class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
            placeholder="Ingrese el precio de venta: S/. 100.00"
          />
          <span class="text-red-400">{{ errors.selling_price }}</span>
        </div>
        <div class="mb-4">
          <label for="stock_min" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
            Stock Minimo
          </label>
          <input
            v-model="stockMin"
            v-bind="stockMinAttrs"
            id="stock_min"
            type="number"
            step="0.01"
            class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
            placeholder="Ingrese el stock mínimo"
          />
          <span class="text-red-400">{{ errors.stock_min }}</span>
        </div>

        <div class="mb-6">
          <label class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
            Imagen de la variante
          </label>

          <FilePond
            ref="filePondRef"
            name="image"
            allowMultiple="true"
            allowFileTypeValidation="true"
            :acceptedFileTypes="['image/*']"
            allowImagePreview="true"
            maxFileSize="15MB"
            imagePreviewHeight="200"
            allowReorder="true"
            @updatefiles="onUpdateFiles"
            labelIdle="Arrastra la imagen o <span class='filepond--label-action'>Examinar</span>"
          />
          <span class="text-red-400" v-if="imagesMeta.touched">{{ imagesError }}</span>
        </div>
        <div class="mt-4 flex items-center mb-6 dark:text-gray-300 text-gray-800">
          <hr class="flex-1" />
          <span class="mx-4"> Seleccione los valores de la variante </span>
          <hr class="flex-1" />
        </div>
        <div class="space-y-4">
          <fieldset v-for="(field, idx) in featureFields" :key="field.key">
            <div
              class="relative rounded-lg border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6"
            >
              <div
                v-if="featureFields.length > 1"
                class="absolute top-2 right-4 px-4 bg-white dark:bg-gray-800"
              >
                <button
                  @click="remove(idx)"
                  type="button"
                  class="text-red-500 hover:text-red-700 font-semibold px-3 py-2"
                >
                  <font-awesome-icon
                    icon="fa-solid fa-trash-can"
                    size="xl"
                    class="transition duration-75 group-hover:text-gray-900 dark:group-hover:text-white"
                  />
                </button>
              </div>
              <div class="mb-4">
                <label
                  :for="`option_product_${idx}`"
                  class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
                >
                  Opciones
                </label>
                <Field
                  validateOnInput
                  :id="`option_product_${idx}`"
                  :name="`features[${idx}].option_product_id`"
                  as="select"
                  class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
                >
                  <option disabled value="">Selecciona una opción</option>
                  <option :value="option.id" v-for="(option, index) in options" :key="index">
                    {{ option.name }}
                  </option>
                </Field>
                <span class="text-red-400">{{ errors[`features[${idx}].option_product_id`] }}</span>
              </div>
              <div class="mb-4">
                <label
                  :for="`option_product_value_${idx}`"
                  class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
                >
                  Valor
                </label>
                <Field
                  validateOnInput
                  :id="`option_product_value_${idx}`"
                  :name="`features[${idx}].option_product_value_id`"
                  as="select"
                  class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
                  :disabled="loadingMap[idx] || !featureFields[idx].value.option_product_id"
                >
                  <option value="" disabled selected>
                    {{ loadingMap[idx] ? 'Cargando...' : 'Selecciona un valor' }}
                  </option>
                  <option v-for="value in valuesMap[idx] || []" :key="value.id" :value="value.id">
                    {{ value.description }}
                  </option>
                </Field>
                <span class="text-red-400">{{
                  errors[`features[${idx}].option_product_value_id`]
                }}</span>
              </div>
            </div>
          </fieldset>
          <span class="text-red-400">{{ errors.features }}</span>
          <div class="flex justify-end">
            <button
              type="button"
              class="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900"
              @click="push({ option_product_id: '', option_product_value_id: '' })"
            >
              Agregar
            </button>
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <ButtonSave name="Guardar" :disabled="!meta.valid" />
        </div>
      </form>
    </div>
    <InfoAlert v-else message="Asigne opciones a este producto, para poder generar las variantes" />
  </div>
</template>

<style scoped>
/* Grid horizontal */
:deep(.filepond--list) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* Tamaño fijo del preview */
:deep(.filepond--item) {
  width: 160px;
  height: 160px;
}

/* Forzar recorte tipo cover */
:deep(.filepond--image-preview-wrapper),
:deep(.filepond--image-preview),
:deep(.filepond--image-preview canvas),
:deep(.filepond--image-preview img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
