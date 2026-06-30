<script setup lang="ts">
import { useCheckout } from '@/composables/usecheckout'
import { customerReciberSchema } from '@/schemas/shop/customerReciber/customerReciberSchema'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'
import { useSweetAlert } from '@/composables/useSweetAlert'
import CustomerSService from '@/services/shop/CustomerSService'
import axios from 'axios'
import Swal from 'sweetalert2'

const customerService = new CustomerSService()
const { deliveryInfo, updateCustomerData, saveToLocalStorage } = useCheckout()

const { handleSubmit, errors, defineField, setValues, setFieldValue } = useForm({
  validationSchema: customerReciberSchema,
  initialValues: {
    name: '',
    last_name: '',
    phone: '',
    document_type: 'DNI',
    document_number: '',
  },
})

const [name, nameAttrs] = defineField('name')
const [lastName, lastNameAttrs] = defineField('last_name')
const [phone, phoneAttrs] = defineField('phone')
const [documentType, documentTypeAttrs] = defineField('document_type')
const [documentNumber, documentNumberAttrs] = defineField('document_number')

// ✅ Estado para búsqueda de DNI
const isSearchingDNI = ref(false)
const canSearchDNI = computed(() => {
  return documentType.value === 'DNI' && documentNumber.value.length === 8
})

// ✅ Función para buscar DNI - CORREGIDA
const searchDNI = async () => {
  if (!canSearchDNI.value) {
    useSweetAlert({
      title: 'DNI inválido',
      text: 'El DNI debe tener exactamente 8 dígitos',
      icon: 'warning',
      timer: 2000,
    })
    return
  }

  isSearchingDNI.value = true

  try {
    useSweetAlert({
      title: 'Buscando...',
      text: 'Consultando DNI',
      icon: 'loading',
    })

    const customer = await customerService.getByDNI(documentNumber.value)

    Swal.close()

    // ✅ SOLUCIÓN: Usar setFieldValue para actualizar solo campos específicos
    // Esto NO marca otros campos como "touched"
    setFieldValue('name', customer.name)
    setFieldValue('last_name', customer.last_name)
    setFieldValue('document_number', customer.document_number)

    // NO tocar phone ni document_type

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
        useSweetAlert({
          title: 'DNI no encontrado',
          text: errorMessage,
          icon: 'info',
          timer: 3000,
        })
      } else if (err.response?.status === 422) {
        useSweetAlert({
          title: 'DNI inválido',
          text: errorMessage,
          icon: 'warning',
          timer: 3000,
        })
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
    isSearchingDNI.value = false
  }
}

// ✅ Cargar datos existentes del checkout al montar
onMounted(() => {
  if (deliveryInfo.value?.reciber) {
    setValues({
      name: deliveryInfo.value.reciber.name || '',
      last_name: deliveryInfo.value.reciber.last_name || '',
      phone: deliveryInfo.value.reciber.phone || '',
      document_type: deliveryInfo.value.reciber.document_type || 'DNI',
      document_number: deliveryInfo.value.reciber.document_number || '',
    })
  }
})

// Sincronizar cambios con el store
watch(
  [name, lastName, phone, documentType, documentNumber],
  () => {
    updateCustomerData({
      name: name.value,
      last_name: lastName.value,
      phone: phone.value,
      document_type: documentType.value as 'DNI' | 'CE',
      document_number: documentNumber.value,
    })
    saveToLocalStorage()
  },
  { deep: true },
)

const onSubmit = handleSubmit(async (values) => {
  updateCustomerData({
    name: values.name,
    last_name: values.last_name,
    phone: values.phone,
    document_type: values.document_type as 'DNI' | 'CE',
    document_number: values.document_number,
  })
  saveToLocalStorage()
  console.log('Form submitted:', values)
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <form @submit.prevent="onSubmit">
      <!-- Card principal -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <!-- Header con icono -->
        <div class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Datos del receptor</h2>
            </div>
          </div>
        </div>
        <!-- Grid de campos -->
        <div class="space-y-5">
          <!-- Fila 2: Tipo documento, Número documento y Teléfono -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <!-- Tipo de documento -->
            <div>
              <label
                for="document_type"
                class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
              >
                Tipo documento
                <span class="text-red-500">*</span>
              </label>
              <select
                v-model="documentType"
                v-bind="documentTypeAttrs"
                id="document_type"
                class="w-full px-4 py-3 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-gray-100 hover:border-blue-400 dark:hover:border-indigo-500 dark:placeholder-gray-400 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none"
              >
                <option value="DNI">DNI</option>
                <option value="CE">CE</option>
              </select>
              <span
                v-if="errors.document_type"
                class="text-sm text-red-500 mt-1 flex items-center gap-1"
              >
                {{ errors.document_type }}
              </span>
            </div>

            <!-- Número de documento CON BOTÓN DE BÚSQUEDA -->
            <div>
              <label
                for="document_number"
                class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
              >
                Número documento
                <span class="text-red-500">*</span>
              </label>

              <!-- ✅ CORREGIDO: Sin maxlength -->
              <div class="relative">
                <input
                  v-model="documentNumber"
                  v-bind="documentNumberAttrs"
                  id="document_number"
                  type="text"
                  placeholder="Ej: 12345678"
                  :class="[
                    'w-full px-4 py-3 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-gray-100 hover:border-blue-400 dark:hover:border-indigo-500 dark:placeholder-gray-400 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none',
                    documentType === 'DNI' ? 'pr-12' : ''
                  ]"
                />

                <!-- ✅ Botón de búsqueda (solo visible si es DNI) -->
                <button
                  v-if="documentType === 'DNI'"
                  type="button"
                  @click="searchDNI"
                  :disabled="!canSearchDNI || isSearchingDNI"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                  :class="canSearchDNI ? 'text-indigo-600 dark:text-indigo-500' : 'text-gray-400 dark:text-gray-500'"
                  title="Buscar DNI"
                >
                  <font-awesome-icon
                    :icon="isSearchingDNI ? 'fa-solid fa-spinner' : 'fa-solid fa-magnifying-glass'"
                    :class="{ 'animate-spin': isSearchingDNI }"
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

            <!-- Teléfono -->
            <div>
              <label
                for="phone"
                class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
              >
                Teléfono
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="phone"
                v-bind="phoneAttrs"
                id="phone"
                type="tel"
                placeholder="Ej: 999 999 999"
                class="w-full px-4 py-3 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-gray-100 hover:border-blue-400 dark:hover:border-indigo-500 dark:placeholder-gray-400 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none"
              />
              <span v-if="errors.phone" class="text-sm text-red-500 mt-1 flex items-center gap-1">
                {{ errors.phone }}
              </span>
            </div>
          </div>

          <!-- Fila 1: Nombres y Apellidos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <!-- Nombres -->
            <div>
              <label
                for="name"
                class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
              >
                Nombres
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="name"
                v-bind="nameAttrs"
                id="name"
                type="text"
                placeholder="Ej: Juan Carlos"
                class="w-full px-4 py-3 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-gray-100 hover:border-blue-400 dark:hover:border-indigo-500 dark:placeholder-gray-400 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none"
              />
              <span v-if="errors.name" class="text-sm text-red-500 mt-1 flex items-center gap-1">
                {{ errors.name }}
              </span>
            </div>

            <!-- Apellidos -->
            <div>
              <label
                for="last_name"
                class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
              >
                Apellidos
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="lastName"
                v-bind="lastNameAttrs"
                id="last_name"
                type="text"
                placeholder="Ej: Pérez García"
                class="w-full px-4 py-3 block bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-gray-100 hover:border-blue-400 dark:hover:border-indigo-500 dark:placeholder-gray-400 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed focus:outline-none"
              />
              <span
                v-if="errors.last_name"
                class="text-sm text-red-500 mt-1 flex items-center gap-1"
              >
                {{ errors.last_name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
