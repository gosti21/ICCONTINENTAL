<script setup lang="ts">
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { variantBarcodeDTO } from '@/DTOs/admin/VariantBarcodeDTO'
import type { BarcodeItemI } from '@/interfaces/admin/variant/BarcodeInterface'
import VariantBarcodeService from '@/services/admin/VariantBarcodeService'
import { Modal, type ModalInterface } from 'flowbite'
import Swal from 'sweetalert2'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const variantBarcodeService = new VariantBarcodeService()

const modalEl = ref<HTMLElement | null>(null)
let modal: ModalInterface | null = null

const items = ref<BarcodeItemI[]>([])

const totalBarcodes = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0)
})

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

const open = () => {
  modal?.show()
}

const close = () => {
  modal?.hide()
}

const addItem = (item: BarcodeItemI) => {
  const existingIndex = items.value.findIndex((i) => i.variant_id === item.variant_id)

  if (existingIndex !== -1) {
    items.value[existingIndex].quantity += item.quantity
  } else {
    items.value.push({ ...item })
  }
}

// ✅ Validación centralizada
const validateQuantity = (value: number | string): number => {
  const num = Number(value)
  if (isNaN(num) || num < 1) return 1
  if (num > 100) return 100
  return Math.floor(num)
}

// ✅ Actualización mejorada
const updateQuantity = (index: number, newQuantity: number | string) => {
  const validated = validateQuantity(newQuantity)
  items.value[index].quantity = validated
}

const removeItem = (index: number) => {
  items.value.splice(index, 1)
}

// ✅ Limpiar con confirmación
const clearAll = async () => {
  if (items.value.length === 0) return

  const result = await Swal.fire({
    title: '¿Limpiar carrito?',
    text: 'Se eliminarán todos los códigos seleccionados',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, limpiar',
    cancelButtonText: 'Cancelar',
  })

  if (result.isConfirmed) {
    items.value = []
  }
}

const generatePDF = async () => {
  if (items.value.length === 0) {
    useSweetAlert({
      title: 'Carrito vacío',
      text: 'Agrega al menos una variante',
      icon: 'warning',
    })
    return
  }

  try {
    useSweetAlert({
      title: 'Generando PDF...',
      text: 'Por favor espera',
      icon: 'loading',
    })

    const payload = {
      items: items.value.map((item) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
      })),
    }

    const blob = await variantBarcodeService.generatePDF(payload as variantBarcodeDTO)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `codigos-barras-${Date.now()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    Swal.close()
    useSweetAlert({
      title: '¡Éxito!',
      text: 'PDF generado correctamente',
      icon: 'success',
    })

    items.value = [] // ✅ Limpiar después de generar
    close()
  } catch (error) {
    Swal.close()
    useSweetAlert({
      title: 'Error',
      text: 'No se pudo generar el PDF',
      icon: 'error',
      timer: 0,
    })
    console.error(error)
  }
}

defineExpose({
  open,
  close,
  addItem,
  items,
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
    <div class="relative p-4 w-full max-w-2xl max-h-full">
      <div
        class="relative bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
      >
        <div
          class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-600"
        >
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Códigos de Barras Seleccionados
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total: {{ totalBarcodes }} código{{ totalBarcodes !== 1 ? 's' : '' }}
            </p>
          </div>
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

        <div class="p-4 max-h-96 overflow-y-auto">
          <div v-if="items.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No hay códigos seleccionados</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg dark:bg-gray-700"
            >
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 dark:text-white truncate">
                  {{ item.variant_name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">SKU: {{ item.sku }}</p>
                <p v-if="item.features" class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ item.features }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="updateQuantity(index, item.quantity - 1)"
                  type="button"
                  class="mr-1 w-8 h-8 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500 cursor-pointer"
                >
                  -
                </button>
                <input
                  :value="item.quantity"
                  @input="updateQuantity(index, ($event.target as HTMLInputElement).value)"
                  @keypress="handleKeypress"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  class="w-16 text-center bg-white border border-gray-300 text-gray-900 rounded-lg p-1.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  @click="updateQuantity(index, item.quantity + 1)"
                  type="button"
                  class="ml-1 w-8 h-8 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500 cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                @click="removeItem(index)"
                type="button"
                class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
              >
                <font-awesome-icon icon="fa-solid fa-trash-can" size="lg" />
              </button>
            </div>
          </div>
        </div>

        <div
          class="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-600"
        >
          <button
            v-if="items.length > 0"
            @click="clearAll"
            type="button"
            class="text-gray-700 hover:text-gray-900 font-medium text-sm dark:text-gray-400 dark:hover:text-white cursor-pointer"
          >
            Limpiar todo
          </button>
          <div class="flex items-center gap-3 ml-auto">
            <button
              @click="close"
              type="button"
              class="text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              @click="generatePDF"
              :disabled="items.length === 0"
              type="button"
              class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <font-awesome-icon icon="fa-solid fa-download" class="mr-2" />
              Generar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
