<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { employeeCreateDTO } from '@/DTOs/admin/employee/EmployeeCreateDTO'
import { createEmployeeSchema } from '@/schemas/admin/employee/createEmployeeValidationSchema'
import EmployeeService from '@/services/admin/EmployeeService'
import CustomerSService from '@/services/shop/CustomerSService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref } from 'vue'

const customerService = new CustomerSService()
const employeeService = new EmployeeService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Empleados', route: 'admin.users.employees' },
  { name: 'Crear' },
])

const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})
const showPassword = ref(false)

const { meta, handleSubmit, errors, defineField, setErrors, setFieldValue } = useForm({
  validationSchema: createEmployeeSchema,
  initialValues: {
    name: '',
    last_name: '',
    phone: '',
    document_type: 'DNI',
    document_number: '',
    email: '',
    password: '',
    position: 'seller',
    salary: ''
  },
})
const [name, nameAttrs] = defineField('name')
const [lastName, lastNameAttrs] = defineField('last_name')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [phone, phoneAttrs] = defineField('phone')
const [salary, salaryAttrs] = defineField('salary')
const [positionType, positionTypeAttrs] = defineField('position')
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

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const onSubmit = handleSubmit(async (values, { resetForm }) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })

    await employeeService.create(values as employeeCreateDTO)
    Swal.close()

    useSweetAlert({
      title: 'Empleado creada',
      text: 'El empleadoi ha sido creada con éxito',
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

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  isLoading.value = false
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <div
    v-else
    class="block p-5 border rounded-lg shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
  >
    <form action="" method="POST" @submit.prevent="onSubmit">
      <!-- Grid de campos -->
      <div class="space-y-5 mb-4">
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
              <option value="DNI" selected>DNI</option>
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
                  documentType === 'DNI' ? 'pr-12' : '',
                ]"
              />

              <!-- ✅ Botón de búsqueda (solo visible si es DNI) -->
              <button
                v-if="documentType === 'DNI'"
                type="button"
                @click="searchDNI"
                :disabled="!canSearchDNI || isSearchingDNI"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                :class="
                  canSearchDNI
                    ? 'text-indigo-600 dark:text-indigo-500'
                    : 'text-gray-400 dark:text-gray-500'
                "
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
      </div>
      <div class="mb-4">
        <label for="name" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Nombres
        </label>
        <input
          v-model="name"
          v-bind="nameAttrs"
          id="name"
          type="text"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el nombre del trabajador"
        />
        <span class="text-red-400">{{ errors.name }}</span>
      </div>
      <div class="mb-4">
        <label for="last_name" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Apellidos
        </label>
        <input
          v-model="lastName"
          v-bind="lastNameAttrs"
          id="last_name"
          type="text"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el apellido del trabajador"
        />
        <span class="text-red-400">{{ errors.last_name }}</span>
      </div>
      <div class="mb-4">
        <label for="email" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Correo Electrónico
        </label>
        <input
          v-model="email"
          v-bind="emailAttrs"
          id="email"
          type="email"
          placeholder="Ingrese el correo electrónico del trabajador"
          class="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
        />
        <span v-if="errors.email" class="text-red-400">{{ errors.email }}</span>
      </div>
      <div class="mb-4">
        <label for="password" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Contraseña
        </label>
        <div class="relative">
          <input
            v-model="password"
            v-bind="passwordAttrs"
            id="password"
            placeholder="Digite la contraseña"
            :type="showPassword ? 'text' : 'password'"
            class="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          />
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="absolute right-3 top-5 transform -translate-y-1/2 mt-0.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
          >
            <font-awesome-icon
              :icon="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
              size="lg"
              class="text-gray-300"
            />
          </button>
        </div>
        <span v-if="errors.password" class="text-sm text-red-400">{{ errors.password }}</span>
      </div>
      <div class="mb-4">
        <label
          for="position"
          class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
        >
          Posición
        </label>
        <select
          v-model="positionType"
          v-bind="positionTypeAttrs"
          id="position"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
        >
          <option value="seller" selected>Vendedor</option>
          <option value="cashier">Cajero</option>
          <option value="support">Soporte</option>
          <option value="other">Otros</option>
        </select>
        <span class="text-red-500">
          {{ errors.position }}
        </span>
      </div>
              <div class="mb-4">
          <label
            for="salary"
            class="block mb-2 font-medium text-gray-900 dark:text-gray-200"
          >
            Sueldo
          </label>
          <input
            v-model="salary"
            v-bind="salaryAttrs"
            id="salary"
            type="number"
            step="0.01"
            class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
            placeholder="Ingrese el sueldo S/. 100.00"
          />
          <span class="text-red-400">{{ errors.salary }}</span>
        </div>
      <div class="flex justify-end">
        <ButtonSave name="Guardar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
