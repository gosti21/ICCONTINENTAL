<script setup lang="ts">
import { Modal, type ModalInterface } from 'flowbite'
import { onMounted, onUnmounted, ref } from 'vue'

const modalEl = ref<HTMLElement | null>(null)
let modal: ModalInterface | null = null

const quantity = ref<number>(1)
const variantName = ref<string>('')
const variantId = ref<number | string>('')
// ✅ CORRECCIÓN: Usar propiedades opcionales
const variantFeatures = ref<Array<{ option?: string; description?: string }>>([])

const emit = defineEmits<{
  (e: 'confirm', variantId: number | string, quantity: number): void
}>()

onMounted(() => {
  if (!modalEl.value) return

  modal = new Modal(modalEl.value, {
    placement: 'center',
    backdrop: 'dynamic',
    closable: true,
  })
})

onUnmounted(() => {
  modal?.hide()
  modal = null
})

// ✅ Función de validación
const validateQuantity = (value: number | string): number => {
  const num = Number(value)
  if (isNaN(num) || num < 1) return 1
  if (num > 100) return 100
  return Math.floor(num)
}

// ✅ Handler mejorado para el input
const handleQuantityInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  quantity.value = validateQuantity(target.value)
}

// ✅ CORRECCIÓN: Tipo más flexible para features
const open = (
  id: number | string,
  name: string,
  features: Array<{ option?: string; description?: string }> = [],
) => {
  variantId.value = id
  variantName.value = name
  variantFeatures.value = features
  quantity.value = 1
  modal?.show()
}

const close = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
  modal?.hide()
}

const handleConfirm = () => {
  const validated = validateQuantity(quantity.value)
  emit('confirm', variantId.value, validated)
  close()
}

defineExpose({
  open,
  close,
})

// Prevenir entrada de caracteres no numéricos
const handleKeypress = (event: KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode
  // Solo permitir números (48-57 son los códigos de 0-9)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault()
  }
}
</script>

<template>
  <div
    ref="modalEl"
    tabindex="-1"
    aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative p-4 w-full max-w-md max-h-full">
      <div
        class="relative bg-white border border-gray-200 rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700"
      >
        <div
          class="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-600"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Generar Códigos de Barras
          </h3>
          <button
            @click="close"
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14">
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>

        <div class="mt-4">
          <!-- ✅ Nombre del producto -->
          <p class="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {{ variantName }}
          </p>

          <!-- ✅ Mostrar features como badges con validación -->
          <div v-if="variantFeatures.length > 0" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="(feature, idx) in variantFeatures"
              :key="idx"
              class="inline-flex text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded px-2 py-1"
            >
              {{ feature.option || 'N/A' }}: {{ feature.description || 'N/A' }}
            </span>
          </div>

          <label
            for="quantity"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
          >
            Cantidad de códigos
          </label>
          <input
            :value="quantity"
            @input="handleQuantityInput"
            @keypress="handleKeypress"
            type="number"
            id="quantity"
            min="1"
            max="100"
            step="1"
            class="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:outline-none focus:ring-1"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Solo números enteros del 1 al 100
          </p>
        </div>

        <div
          class="flex items-center justify-end space-x-3 mt-6 border-t border-gray-200 pt-4 dark:border-gray-600"
        >
          <button
            @click="close"
            type="button"
            class="text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="handleConfirm"
            type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
