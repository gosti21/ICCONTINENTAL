<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { productCreateDTO } from '@/DTOs/admin/product/ProductCreateDTO'
import type { brandI } from '@/interfaces/admin/BrandInterface'
import type { categoryI, categorySubI } from '@/interfaces/admin/CategoryInterface'
import type { SpecificationI } from '@/interfaces/admin/SpecificationInterface'
import { createProductSchema } from '@/schemas/admin/product/createProductValidationSchema'
import BrandService from '@/services/admin/BrandService'
import CategoryService from '@/services/admin/CategoryService'
import ProductService from '@/services/admin/ProductService'
import SpecificationService from '@/services/admin/SpecificationService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { Field, FieldArray, useForm } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'

const brandService = new BrandService()
const categoryService = new CategoryService()
const productService = new ProductService()
const specificationService = new SpecificationService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Productos', route: 'admin.catalog.products' },
  { name: 'Crear' },
])

const brands = ref<brandI[]>([])
const categories = ref<categoryI[]>([])
const subcategories = ref<categorySubI[]>([])
const specifications = ref<SpecificationI[]>([])

const showDebug = ref(false)

const isLoading = ref(true)
const isSubcategoriesLoading = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

const loadData = async () => {
  try {
    ;[brands.value, categories.value, specifications.value] = await Promise.all([
      brandService.getAllList(),
      categoryService.getAllList(),
      specificationService.getAllList(),
    ])
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const { meta, handleSubmit, errors, defineField, setErrors, resetField } = useForm({
  validationSchema: createProductSchema,
  initialValues: {
    brand_id: '',
    category_id: '',
    subcategory_id: '',
    name: '',
    model: '',
    description: '',
    specifications: [{ specification_id: '', value: '' }],
  },
})

const [name, nameAttrs] = defineField('name')
const [brandId, brandIdAttrs] = defineField('brand_id')
const [categoryId, categoryIdAttrs] = defineField('category_id')
const [subcategoryId, subcategoryIdAttrs] = defineField('subcategory_id')
const [model, modelAttrs] = defineField('model')
const [description, descriptionAttrs] = defineField('description')

// Watch para actualizar subcategorías al cambiar categoría
watch(categoryId, async (newCategoryId) => {
  subcategories.value = [] // limpiar subcategorías
  resetField('subcategory_id') // limpia valor y error sin marcar como tocado

  if (!newCategoryId) return

  try {
    isSubcategoriesLoading.value = true
    subcategories.value = await categoryService.getAllSubcategories(newCategoryId)
  } catch (err) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudieron cargar las subcategorías',
      icon: 'error',
    })
    console.error(err)
  } finally {
    isSubcategoriesLoading.value = false
  }
})

onMounted(async () => {
  loadData()
})

const onSubmit = handleSubmit(async (values, { resetForm }) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })
    const payload = {
      brand_id: values.brand_id,
      subcategory_id: values.subcategory_id,
      name: values.name,
      model: values.model,
      description: values.description,
      specifications: values.specifications,
    }
    await productService.create(payload as productCreateDTO)
    Swal.close()

    useSweetAlert({
      title: 'Producto creado',
      text: 'El producto ha sido creado con éxito',
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
    <div class="mb-4">
      <button
        type="button"
        class="text-sm px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
        @click="showDebug = !showDebug"
      >
        {{ showDebug ? 'Ocultar debug' : 'Mostrar debug' }}
      </button>

      <div v-if="showDebug" class="mt-2 text-xs bg-gray-50 p-2 rounded">
        <strong>Debug datos:</strong>
        <pre class="whitespace-pre-wrap text-xs mt-1">{{ { isLoading, brands, categories, subcategories } }}</pre>
      </div>
    </div>
    <form action="" method="POST" @submit.prevent="onSubmit">
      <div class="mb-4">
        <label for="brand_id" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Marcas
        </label>
        <select
          v-model="brandId"
          v-bind="brandIdAttrs"
          id="brand_id"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
        >
          <option disabled value="">Selecciona una marca</option>
          <option :value="brand.id" v-for="(brand, index) in brands" :key="index">
            {{ brand.name }}
          </option>
        </select>
        <span class="text-red-400">{{ errors.brand_id }}</span>
      </div>

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
        <label for="subcategory_id" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Subcategorias
        </label>
        <select
          v-model="subcategoryId"
          v-bind="subcategoryIdAttrs"
          id="subcategory_id"
          class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
          :disabled="isSubcategoriesLoading || !categoryId"
        >
          <option disabled value="">{{ isSubcategoriesLoading ? 'Cargando...' : 'Selecciona una subcategoria' }}</option>
          <option
            :value="subcategory.id"
            v-for="(subcategory, index) in subcategories"
            :key="index"
          >
            {{ subcategory.name }}
          </option>
        </select>
        <span class="text-red-400">{{ errors.subcategory_id }}</span>
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
          placeholder="Ingrese el nombre del producto"
        />
        <span class="text-red-400">{{ errors.name }}</span>
      </div>

      <div class="mb-4">
        <label for="model" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Modelo
        </label>
        <input
          v-model="model"
          v-bind="modelAttrs"
          id="model"
          type="text"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el modelo del producto"
        />
        <span class="text-red-400">{{ errors.model }}</span>
      </div>

      <div class="mb-4">
        <label for="description" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Descripción
        </label>
        <textarea
          v-model="description"
          v-bind="descriptionAttrs"
          id="description"
          rows="4"
          class="block p-2.5 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese una descripción para el producto"
        ></textarea>
        <span class="text-red-400">{{ errors.description }}</span>
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
            <span class="text-red-400">{{ errors.specifications }}</span>
            <FieldArray name="specifications" v-slot="{ fields, push, remove }">
              <fieldset v-for="(field, idx) in fields" :key="field.key">
                <div class="flex gap-6 mb-2 mt-2">
                  <div class="space-y-2 flex-1">
                    <label
                      :for="`specification_${idx}`"
                      class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
                    >
                      Nombre
                    </label>
                    <Field
                      :id="`specification_${idx}`"
                      :name="`specifications[${idx}].specification_id`"
                      as="select"
                      class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none focus:ring-1"
                    >
                      <option disabled value="">Selecciona una especificación</option>
                      <option
                        :value="specification.id"
                        v-for="(specification, index) in specifications"
                        :key="index"
                      >
                        {{ specification.name }}
                      </option>
                    </Field>
                    <span class="text-red-400">{{
                      errors[`specifications[${idx}].specification_id`]
                    }}</span>
                  </div>
                  <div class="flex-1">
                    <label
                      :for="`value_${idx}`"
                      class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
                    >
                      Valor
                    </label>
                    <Field
                      :id="`value_${idx}`"
                      :name="`specifications[${idx}].value`"
                      type="text"
                      validateOnInput
                      class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
                      placeholder="Ingrese el valor"
                    >
                    </Field>
                    <span class="text-red-400">{{ errors[`specifications[${idx}].value`] }}</span>
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
                  @click="push({ specification_id: '', value: '' })"
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
