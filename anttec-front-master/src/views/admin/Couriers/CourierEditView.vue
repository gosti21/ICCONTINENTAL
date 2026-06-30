<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { courierCreateDTO } from '@/DTOs/admin/courier/CourierCreateDTO'
import type { courierI } from '@/interfaces/admin/CourierInterface'
import { editCourierSchema } from '@/schemas/admin/courier/editCourierValidationSchema'
import CourierService from '@/services/admin/CourierService'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const courierService = new CourierService()

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const isLoading = ref(true)
const courier = ref<courierI | null>(null)
const serverErrors = ref<Record<string, string[]>>({})

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Couriers', route: 'admin.couriers' },
  {
    name: courier.value ? `Editar - ${courier.value.name}` : 'Editar',
   },
])

const { meta, handleSubmit, errors, defineField, setErrors, resetForm } = useForm({
  validationSchema: editCourierSchema,
})
const [name, nameAttrs] = defineField('name')
const [phone, phoneAttrs] = defineField('phone')
const [email, emailAttrs] = defineField('email')
const [district, districtAttrs] = defineField('district')
const [street, streetAttrs] = defineField('street')
const [reference, referenceAttrs] = defineField('reference')

const loadCategories = async () => {
  try {
    courier.value = await courierService.getById(id)
    resetForm({
      values: {
        name: courier.value.name,
        phone: courier.value.phone,
        email: courier.value.email ?? '',
        district: courier.value.district,
        street: courier.value.street,
        reference: courier.value.reference,
      }
    })
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadCategories()
})

const onSubmit = handleSubmit(async (values, { resetForm }) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })

    await courierService.update(values as courierCreateDTO, id)
    Swal.close()

    useSweetAlert({
      title: 'Courier actualizado',
      text: 'El courier ha sido actualizado con éxito',
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
    <form action="" method="POST" @submit.prevent="onSubmit">
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
          placeholder="Ingrese el nombre del courier"
        />
        <span class="text-red-400">{{ errors.name }}</span>
      </div>
      <div class="mb-4">
        <label
          for="phone"
          class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
        >
          Teléfono
        </label>
        <input
          v-model="phone"
          v-bind="phoneAttrs"
          id="phone"
          type="tel"
          placeholder="Ej: 999 999 999"
          class="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
        />
        <span v-if="errors.phone" class="text-red-400">
          {{ errors.phone }}
        </span>
      </div>
      <div class="mb-4">
        <label for="email" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Correo Electrónico (Opcional)
        </label>
        <input
          v-model="email"
          v-bind="emailAttrs"
          id="email"
          type="email"
          placeholder="Ingrese el correo electrónico"
          class="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
        />
        <span v-if="errors.email" class="text-red-400">{{ errors.email }}</span>
      </div>
      <div class="mb-4">
        <label for="district" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Distrito
        </label>
        <input
          v-model="district"
          v-bind="districtAttrs"
          id="district"
          type="text"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el nombre del distrito"
        />
        <span class="text-red-400">{{ errors.district }}</span>
      </div>
      <div class="mb-4">
        <label for="street" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Calle
        </label>
        <input
          v-model="street"
          v-bind="streetAttrs"
          id="street"
          type="text"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el nombre de la calle"
        />
        <span class="text-red-400">{{ errors.street }}</span>
      </div>
      <div class="mb-4">
        <label for="reference" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Referencia
        </label>
        <input
          v-model="reference"
          v-bind="referenceAttrs"
          id="reference"
          type="text"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese la referencia"
        />
        <span class="text-red-400">{{ errors.reference }}</span>
      </div>
      <div class="flex justify-end">
        <ButtonSave name="Guardar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>
