<script setup lang="ts">
import { facturaSchema } from '@/schemas/shop/invoice/facturaSchema'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'
import { useCheckout } from '@/composables/usecheckout'
import { useSweetAlert } from '@/composables/useSweetAlert'
import CustomerSService from '@/services/shop/CustomerSService'
import axios from 'axios'
import Swal from 'sweetalert2'

// ─── Store ───────────────────────────────────────────
const { checkoutState, saveToLocalStorage } = useCheckout()
const customerService = new CustomerSService()

// ─── Flag para evitar que el watch dispare al montar ─
const isMounted = ref(false)

// ─── vee-validate ────────────────────────────────────
const { errors, defineField, setFieldValue, resetForm } = useForm({
  validationSchema: facturaSchema,
  initialValues: {
    document_type: 'RUC',
    document_number: '',
    business_name: '',
    tax_address: '',
  },
})

const [documentNumber, documentNumberAttrs] = defineField('document_number')
const [businessName, businessNameAttrs] = defineField('business_name')
const [taxAddress, taxAddressAttrs] = defineField('tax_address')

// ─── Búsqueda ────────────────────────────────────────
const isSearching = ref(false)

const canSearchRUC = computed(() => {
  return documentNumber.value.length === 11
})

const searchRUC = async () => {
  if (!canSearchRUC.value) return

  isSearching.value = true

  try {
    useSweetAlert({ title: 'Buscando...', text: 'Consultando RUC', icon: 'loading' })

    const empresa = await customerService.getByRUC(documentNumber.value)

    Swal.close()

    setFieldValue('business_name', empresa.business_name)
    setFieldValue('tax_address', empresa.tax_address)

    useSweetAlert({
      title: 'Empresa encontrada',
      text: 'Los datos han sido cargados automáticamente',
      icon: 'success',
      timer: 2000,
    })
  } catch (err) {
    Swal.close()

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.message || 'Error al buscar el RUC'

      if (err.response?.status === 404) {
        useSweetAlert({ title: 'RUC no encontrado', text: errorMessage, icon: 'info', timer: 3000 })
      } else if (err.response?.status === 422) {
        useSweetAlert({ title: 'RUC inválido', text: errorMessage, icon: 'warning', timer: 3000 })
      } else {
        useSweetAlert({
          title: 'Error',
          text: 'No se pudo consultar el RUC. Intenta de nuevo.',
          icon: 'error',
          timer: 3000,
        })
      }
    }
  } finally {
    isSearching.value = false
  }
}

// ─── Cargar datos desde el store al montar ──────────
onMounted(() => {
  const billing = checkoutState.value.billing

  // ✅ CORREGIDO: Validar que billing existe y es del tipo correcto
  if (billing && billing.type_voucher === 'factura') {
    resetForm({
      values: {
        document_type: 'RUC',
        document_number: billing.document_number || '',
        business_name: billing.customer?.business_name || '', // ✅ Uso de optional chaining
        tax_address: billing.customer?.tax_address || '', // ✅ Uso de optional chaining
      },
    })
  } else {
    // ✅ Si no hay billing válido, inicializar con valores por defecto
    resetForm({
      values: {
        document_type: 'RUC',
        document_number: '',
        business_name: '',
        tax_address: '',
      },
    })
  }

  setTimeout(() => {
    isMounted.value = true
  }, 0)
})

// ─── Sincronizar campos → store ──────────────────────
watch(
  [documentNumber, businessName, taxAddress],
  () => {
    // Solo sincronizar después de que el componente haya terminado de montar
    if (!isMounted.value) return

    checkoutState.value.billing = {
      ...checkoutState.value.billing,
      type_voucher: 'factura',
      document_number: documentNumber.value,
      customer: {
        business_name: businessName.value,
        tax_address: taxAddress.value,
      },
    }
    saveToLocalStorage()
  },
  { deep: true },
)
</script>

<template>
  <div class="space-y-4">
    <!-- RUC con botón de búsqueda -->
    <div>
      <label
        for="factura_document_number"
        class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
      >
        RUC
        <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <input
          v-model="documentNumber"
          v-bind="documentNumberAttrs"
          id="factura_document_number"
          type="text"
          placeholder="Ej: 20123456789"
          maxlength="11"
          class="w-full px-4 py-3 pr-12 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 dark:text-gray-100 hover:border-green-400 focus:outline-none"
        />

        <!-- Botón de búsqueda RUC -->
        <button
          type="button"
          @click="searchRUC"
          :disabled="!canSearchRUC || isSearching"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer"
          :class="
            canSearchRUC
              ? 'text-green-600 dark:text-green-500'
              : 'text-gray-400 dark:text-gray-500'
          "
          title="Buscar RUC"
        >
          <font-awesome-icon
            :icon="isSearching ? 'fa-solid fa-spinner' : 'fa-solid fa-magnifying-glass'"
            :class="{ 'animate-spin': isSearching }"
            class="text-lg"
          />
        </button>
      </div>
      <span
        v-if="errors.document_number"
        class="text-sm text-red-500 mt-1 flex items-center gap-1"
      >
        {{ errors.document_number }}
      </span>
    </div>

    <!-- Razón Social -->
    <div>
      <label
        for="factura_business_name"
        class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
      >
        Razón Social
        <span class="text-red-500">*</span>
      </label>
      <input
        v-model="businessName"
        v-bind="businessNameAttrs"
        id="factura_business_name"
        type="text"
        placeholder="Nombre de la empresa"
        class="w-full px-4 py-3 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 dark:text-gray-100 hover:border-green-400 focus:outline-none"
      />
      <span
        v-if="errors.business_name"
        class="text-sm text-red-500 mt-1 flex items-center gap-1"
      >
        {{ errors.business_name }}
      </span>
    </div>

    <!-- Dirección Fiscal -->
    <div>
      <label
        for="factura_tax_address"
        class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
      >
        Dirección Fiscal
        <span class="text-red-500">*</span>
      </label>
      <input
        v-model="taxAddress"
        v-bind="taxAddressAttrs"
        id="factura_tax_address"
        type="text"
        placeholder="Dirección completa de la empresa"
        class="w-full px-4 py-3 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 dark:text-gray-100 hover:border-green-400 focus:outline-none"
      />
      <span
        v-if="errors.tax_address"
        class="text-sm text-red-500 mt-1 flex items-center gap-1"
      >
        {{ errors.tax_address }}
      </span>
    </div>
  </div>
</template>
