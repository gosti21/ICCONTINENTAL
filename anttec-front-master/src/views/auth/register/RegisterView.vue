<script setup lang="ts">
import AnimationLoader from '@/components/AnimationLoader.vue'
import AuthenticationCard from '@/components/auth/AuthenticationCard.vue'
import ButtonAuth from '@/components/auth/ButtonAuth.vue'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { registerDTO } from '@/DTOs/auth/RegisterDTO'
import { registerSchema } from '@/schemas/auth/registerValidationSchema'
import AuthService from '@/services/auth/AuthService'
import { useAuthStore } from '@/stores/useAuthStore'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const authService = new AuthService()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

const { meta, handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: registerSchema,
})

const [name, nameAttrs] = defineField('name')
const [last_name, lastNameAttrs] = defineField('last_name')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [password_confirmation, passwordConfirmationAttrs] = defineField('password_confirmation')

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const togglePasswordConfirmationVisibility = () => {
  showPasswordConfirmation.value = !showPasswordConfirmation.value
}

const onSubmit = handleSubmit(async (values) => {
  try {
    useSweetAlert({
      title: 'Creando cuenta',
      text: 'Espere un momento',
      icon: 'loading',
    })

    const response = await authService.register(values as registerDTO)
    await authStore.setAuthData(response.token, response.user)

    Swal.close()

    useSweetAlert({
      title: '¡Registro exitoso!',
      text: 'Tu cuenta ha sido creada correctamente',
      icon: 'success',
      timer: 2000,
    })

    const redirectTo = route.query.redirect as string

    setTimeout(() => {
      if (redirectTo && redirectTo !== '/register' && redirectTo !== '/login') {
        router.push(redirectTo)
      } else {
        // Si no, redirigir según rol
        if (authStore.isAdmin) {
          router.push({ name: 'admin.dashboard' })
        } else {
          router.push({ name: 'shop.home' })
        }
      }
    }, 1000)
  } catch (err) {
    Swal.close()
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      if (status === 422) {
        const validationErrors = err.response?.data.errors
        serverErrors.value = validationErrors
        const veeValidateErrors: Record<string, string> = {}
        Object.keys(validationErrors).forEach((field) => {
          veeValidateErrors[field] = validationErrors[field][0]
        })
        setErrors(veeValidateErrors)
      } else if (status === 401) {
        useSweetAlert({
          title: 'Credenciales inválidas',
          text: 'El correo o la contraseña no son correctos.',
          icon: 'error',
          timer: 0,
        })
      } else {
        useSweetAlert({
          title: 'Algo salió mal',
          text: 'Intenta de nuevo',
          icon: 'error',
          timer: 0,
        })
      }
    } else {
      useSweetAlert({
        title: 'Error desconocido',
        text: 'Algo salió mal. Intenta más tarde.',
        icon: 'error',
        timer: 0,
      })
    }
  }
})

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  isLoading.value = false
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <AuthenticationCard v-else class="my-10">
    <template #title>Crear Cuenta</template>
    <template #subtitle>Regístrate para comenzar a comprar</template>

    <form @submit="onSubmit" class="space-y-4">
      <!-- Nombre y Apellido en grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Nombre -->
        <div>
          <label for="name" class="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Nombre
          </label>
          <input
            v-model="name"
            v-bind="nameAttrs"
            id="name"
            type="text"
            placeholder="Ingrese sus nombres"
            class="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          />
          <span v-if="errors.name" class="text-sm text-red-400">{{ errors.name }}</span>
        </div>

        <!-- Apellido -->
        <div>
          <label for="last_name" class="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Apellido
          </label>
          <input
            v-model="last_name"
            v-bind="lastNameAttrs"
            id="last_name"
            placeholder="Ingrese sus apellidos"
            type="text"
            class="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          />
          <span v-if="errors.last_name" class="text-sm text-red-400">{{ errors.last_name }}</span>
        </div>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block mb-2 font-medium text-gray-700 dark:text-gray-300">
          Correo Electrónico
        </label>
        <input
          v-model="email"
          v-bind="emailAttrs"
          id="email"
          type="email"
          placeholder="Ingrese su correo electrónico"
          class="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
        />
        <span v-if="errors.email" class="text-sm text-red-400">{{ errors.email }}</span>
      </div>

      <!-- Contraseña -->
      <div>
        <label for="password" class="block mb-2 font-medium text-gray-700 dark:text-gray-300">
          Contraseña
        </label>
        <div class="relative">
          <input
            v-model="password"
            v-bind="passwordAttrs"
            id="password"
            placeholder="Digite su contraseña"
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

      <!-- Confirmar Contraseña -->
      <div>
        <label
          for="password_confirmation"
          class="block mb-2 font-medium text-gray-700 dark:text-gray-300"
        >
          Confirmar Contraseña
        </label>
        <div class="relative">
          <input
            v-model="password_confirmation"
            v-bind="passwordConfirmationAttrs"
            id="password_confirmation"
            placeholder="Confirme su contraseña"
            :type="showPasswordConfirmation ? 'text' : 'password'"
            class="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          />
          <button
            type="button"
            @click="togglePasswordConfirmationVisibility"
            class="absolute right-3 top-5 transform -translate-y-1/2 mt-0.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
          >
            <font-awesome-icon
              :icon="showPasswordConfirmation ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
              size="lg"
              class="text-gray-300"
            />
          </button>
        </div>
        <span v-if="errors.password_confirmation" class="text-sm text-red-400">
          {{ errors.password_confirmation }}
        </span>
      </div>

      <!-- Botón Submit -->
      <div class="pt-2 flex justify-end">
        <ButtonAuth name="CREAR CUENTA" :disabled="!meta.valid" />
      </div>

      <!-- Link a Login -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes cuenta?
          <router-link
            :to="{ name: 'login' }"
            class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Inicia sesión aquí
          </router-link>
        </p>
      </div>
    </form>
  </AuthenticationCard>
</template>
