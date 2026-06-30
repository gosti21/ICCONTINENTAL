<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { variantEditDTO } from '@/DTOs/admin/editVariantDTO'
import type { variantI } from '@/interfaces/admin/variant/variantInterface'
import { editVariantSchema } from '@/schemas/admin/variant/editVariantValidationSchema'
import VariantService from '@/services/admin/VariantService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const variantService = new VariantService()

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})
const variant = ref<variantI | null>(null)

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Inventario', route: 'admin.store.variants' },
  {
    name: variant.value
      ? `Editar - ${variant.value.product.name} (${variant.value.sku})`
      : 'Editar',
  },
])

const { meta, handleSubmit, errors, defineField, resetForm, setErrors } = useForm({
  validationSchema: editVariantSchema,
})

const [sellingPrice, sellingPriceAttrs] = defineField('selling_price')
const [purcharsePrice, purcharsePriceAttrs] = defineField('purcharse_price')
const [stockMin, stockMinAttrs] = defineField('stock_min')

const loadVariant = async () => {
  try {
    variant.value = await variantService.getById(id)

    // ✅ Resetear el formulario con los valores actuales
    resetForm({
      values: {
        selling_price: variant.value.selling_price,
        purcharse_price: variant.value.purcharse_price,
        stock_min: variant.value.branch_stock.stock_min,
      },
    })
  } catch (error) {
    useSweetAlert({
      title: 'Error',
      text: 'No se pudo cargar la variante',
      icon: 'error',
      timer: 0,
    })
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const onSubmit = handleSubmit(async (values) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })
console.log(values)
    await variantService.update(values as variantEditDTO, id)

    Swal.close()
    useSweetAlert({
      title: 'Variante actualizada',
      text: 'La variante ha sido actualizada con éxito',
      icon: 'success',
    })

    // ✅ Recargar los datos actualizados
    await loadVariant()
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

onMounted(() => {
  loadVariant()
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <div v-else>
    <!-- Información del Producto (Read-only) -->
    <div
      class="mb-6 p-5 border rounded-lg shadow-sm bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Información del Producto
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Producto:</p>
          <p class="text-base font-medium text-gray-900 dark:text-white">
            {{ variant?.product.name }} - {{ variant?.product.model }}
          </p>
        </div>

        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400">SKU:</p>
          <p class="text-base font-medium text-gray-900 dark:text-white">
            {{ variant?.sku }}
          </p>
        </div>

        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Stock Actual:</p>
          <p class="text-base font-medium text-gray-900 dark:text-white">
            {{ variant?.branch_stock.stock }} unidades
          </p>
        </div>

        <div v-if="variant?.features && variant.features.length > 0">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Características:</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(feature, idx) in variant.features"
              :key="idx"
              class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              {{ feature.option }}: {{ feature.description }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario de Edición -->
    <div
      class="block p-5 border rounded-lg shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Editar Información de la Variante
      </h3>

      <form @submit.prevent="onSubmit">
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
            Stock Mínimo
          </label>
          <input
            v-model="stockMin"
            v-bind="stockMinAttrs"
            id="stock_min"
            type="number"
            class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
            placeholder="Ingrese el stock mínimo"
          />
          <span class="text-red-400">{{ errors.stock_min }}</span>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            El sistema te alertará cuando el stock llegue a este nivel
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <router-link :to="{ name: 'admin.store.variants' }">
            <button
              type="button"
              class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </router-link>
          <ButtonSave name="Actualizar" :disabled="!meta.valid" />
        </div>
      </form>
    </div>

    <!-- Nota Informativa -->
    <div
      class="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
    >
      <p class="text-sm text-blue-700 dark:text-blue-300">
        <strong>Nota:</strong> Las características de la variante (como color, talla, etc.) no se
        pueden modificar. Para cambiar las características, debes crear una nueva variante.
      </p>
    </div>
  </div>
</template>
