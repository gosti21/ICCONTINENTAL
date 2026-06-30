<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCheckout } from '@/composables/usecheckout'
import BillingTypeSelector from './BillingTypeSelector.vue'
import BoletaForm from './BoletaForm.vue'
import FacturaForm from './FacturaForm.vue'

const { checkoutState, saveToLocalStorage } = useCheckout()

// Estado del formulario
const documentType = ref<'boleta' | 'factura'>(
  checkoutState.value.billing?.type_voucher || 'boleta',
)

// Al cambiar tipo de comprobante, resetear billing en el store
// Los formularios hijos se montan frescos y cargan desde el store
watch(documentType, (newType) => {
  if (newType === 'boleta') {
    checkoutState.value.billing = {
      type_voucher: 'boleta',
      document_type: 'DNI',
      document_number: '',
      customer: {
        name: '',
        last_name: '',
      },
    }
  } else {
    checkoutState.value.billing = {
      type_voucher: 'factura',
      document_type: 'RUC',
      document_number: '',
      customer: {
        business_name: '',
        tax_address: '',
      },
    }
  }
  saveToLocalStorage()
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Card principal -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
    >
      <!-- Header -->
      <div class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
          >
            <font-awesome-icon
              icon="fa-solid fa-file-invoice"
              class="text-xl text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
              Datos de facturación
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Selecciona el tipo de comprobante
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-5">
        <!-- Selector de tipo de comprobante -->
        <BillingTypeSelector v-model="documentType" />

        <!-- Formulario según tipo seleccionado -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
          mode="out-in"
        >
          <!-- Formulario de Boleta -->
          <BoletaForm v-if="documentType === 'boleta'" />

          <!-- Formulario de Factura -->
          <FacturaForm v-else/>
        </transition>
      </div>
    </div>
  </div>
</template>
