<script setup lang="ts">
import { useCheckout } from '@/composables/usecheckout'
import { useSweetAlert } from '@/composables/useSweetAlert'
import { boletaSchema } from '@/schemas/shop/invoice/boletaSchema'
import CustomerSService from '@/services/shop/CustomerSService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'

// ─── Store ───────────────────────────────────────────
const { checkoutState, saveToLocalStorage } = useCheckout()
const customerService = new CustomerSService()

// ─── Flag para evitar que el watch dispare al montar ─
const isMounted = ref(false)

// ─── vee-validate ────────────────────────────────────
const { errors, defineField, setFieldValue, resetForm, setFieldTouched } = useForm({
  validationSchema: boletaSchema,
  initialValues: {
    document_type: 'DNI',
    document_number: '',
    name: '',
    last_name: '',
  },
})

const [documentType, documentTypeAttrs] = defineField('document_type')
const [documentNumber, documentNumberAttrs] = defineField('document_number')
const [name, nameAttrs] = defineField('name')
const [lastName, lastNameAttrs] = defineField('last_name')

// ─── Búsqueda ────────────────────────────────────────
const isSearching = ref(false)

const canSearchDNI = computed(() => {
  return documentType.value === 'DNI' && documentNumber.value.length === 8
})

const documentPlaceholder = computed(() => {
  return documentType.value === 'DNI' ? 'Ej: 12345678' : 'Ej: 001234567890'
})

const searchDNI = async () => {
  if (!canSearchDNI.value) return

  isSearching.value = true

  try {
    useSweetAlert({ title: 'Buscando...', text: 'Consultando DNI', icon: 'loading' })

    const customer = await customerService.getByDNI(documentNumber.value)

    Swal.close()

    setFieldValue('name', customer.name)
    setFieldValue('last_name', customer.last_name)

    useSweetAlert({
      title: 'Cliente encontrado',
      text: 'Los datos han sido cargados automáticamente',
      icon: 'success',
      timer: 2000,
    })
  } catch (err) {
    Swal.close()

    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.message || 'Error al buscar el DNI'

      if (err.response?.status === 404) {
        useSweetAlert({ title: 'DNI no encontrado', text: errorMessage, icon: 'info', timer: 3000 })
      } else if (err.response?.status === 422) {
        useSweetAlert({ title: 'DNI inválido', text: errorMessage, icon: 'warning', timer: 3000 })
      } else {
        useSweetAlert({
          title: 'Error',
          text: 'No se pudo consultar el DNI. Intenta de nuevo.',
          icon: 'error',
          timer: 3000,
        })
      }
    }
  } finally {
    isSearching.value = false
  }
}

// ─── Limpiar número cuando cambia tipo de documento ─
watch(documentType, () => {
  if (isMounted.value) {
    // ✅ SOLUCIÓN: Limpiar el campo SIN marcarlo como "touched"
    setFieldValue('document_number', '', false) // ← El tercer parámetro "false" evita validación
    setFieldTouched('document_number', false) // ← Marca como "no tocado"
  }
})

// ─── Cargar datos desde el store al montar ──────────
onMounted(() => {
  const billing = checkoutState.value.billing

  // ✅ CORREGIDO: Validar que billing existe y es del tipo correcto
  if (billing && billing.type_voucher === 'boleta') {
    resetForm({
      values: {
        document_type: billing.document_type || 'DNI',
        document_number: billing.document_number || '',
        name: billing.customer?.name || '', // ✅ Uso de optional chaining
        last_name: billing.customer?.last_name || '', // ✅ Uso de optional chaining
      },
    })
  } else {
    // ✅ Si no hay billing válido, inicializar con valores por defecto
    resetForm({
      values: {
        document_type: 'DNI',
        document_number: '',
        name: '',
        last_name: '',
      },
    })
  }

  setTimeout(() => {
    isMounted.value = true
  }, 0)
})

// ─── Sincronizar campos → store ──────────────────────
watch(
  [documentType, documentNumber, name, lastName],
  () => {
    if (!isMounted.value) return

    checkoutState.value.billing = {
      ...checkoutState.value.billing,
      type_voucher: 'boleta',
      document_type: documentType.value as 'DNI' | 'CE',
      document_number: documentNumber.value,
      customer: {
        name: name.value,
        last_name: lastName.value,
      },
    }
    saveToLocalStorage()
  },
  { deep: true },
)
</script>

<template>
  <div class="space-y-4">
    <!-- Fila 1: Tipo documento y Número documento -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <!-- Tipo de documento -->
      <div class="md:col-span-4">
        <label
          for="boleta_document_type"
          class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
        >
          Tipo documento
          <span class="text-red-500">*</span>
        </label>
        <select
          v-model="documentType"
          v-bind="documentTypeAttrs"
          id="boleta_document_type"
          class="w-full px-4 py-3 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-gray-100 hover:border-blue-400 focus:outline-none"
        >
          <option value="DNI">DNI</option>
          <option value="CE">CE</option>
        </select>
        <span v-if="errors.document_type" class="text-sm text-red-500 mt-1 flex items-center gap-1">
          {{ errors.document_type }}
        </span>
      </div>

      <!-- Número de documento con botón de búsqueda -->
      <div class="md:col-span-8">
        <label
          for="boleta_document_number"
          class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
        >
          Número documento
          <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            v-model="documentNumber"
            v-bind="documentNumberAttrs"
            id="boleta_document_number"
            type="text"
            :placeholder="documentPlaceholder"
            :class="[
              'w-full px-4 py-3 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-gray-100 hover:border-blue-400 focus:outline-none',
              documentType === 'DNI' ? 'pr-12' : '',
            ]"
          />

          <!-- Botón de búsqueda (solo si es DNI) -->
          <button
            v-if="documentType === 'DNI'"
            type="button"
            @click="searchDNI"
            :disabled="!canSearchDNI || isSearching"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
            :class="
              canSearchDNI
                ? 'text-indigo-500 dark:text-indigo-500'
                : 'text-gray-400 dark:text-gray-500'
            "
            title="Buscar DNI"
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
    </div>

    <!-- Fila 2: Nombres y Apellidos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Nombres -->
      <div>
        <label
          for="boleta_name"
          class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
        >
          Nombres
          <span class="text-red-500">*</span>
        </label>
        <input
          v-model="name"
          v-bind="nameAttrs"
          id="boleta_name"
          type="text"
          placeholder="Ej: Juan Carlos"
          class="w-full px-4 py-3 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-gray-100 hover:border-blue-400 focus:outline-none"
        />
        <span v-if="errors.name" class="text-sm text-red-500 mt-1 flex items-center gap-1">
          {{ errors.name }}
        </span>
      </div>

      <!-- Apellidos -->
      <div>
        <label
          for="boleta_last_name"
          class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
        >
          Apellidos
          <span class="text-red-500">*</span>
        </label>
        <input
          v-model="lastName"
          v-bind="lastNameAttrs"
          id="boleta_last_name"
          type="text"
          placeholder="Ej: Pérez García"
          class="w-full px-4 py-3 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-gray-100 hover:border-blue-400 focus:outline-none"
        />
        <span v-if="errors.last_name" class="text-sm text-red-500 mt-1 flex items-center gap-1">
          {{ errors.last_name }}
        </span>
      </div>
    </div>
  </div>
</template>
