<script setup lang="ts">
import AnimationLoader from '@/components/AnimationLoader.vue'
import AuthenticationCard from '@/components/auth/AuthenticationCard.vue'
import ButtonAuth from '@/components/auth/ButtonAuth.vue'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { loginDTO } from '@/DTOs/auth/LoginDTO'
import AuthService from '@/services/auth/AuthService'
import { useAuthStore } from '@/stores/useAuthStore'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router' // ← AGREGAR useRoute
import { loginSchema } from '../../../schemas/auth/loginValidationSchema'

const authService = new AuthService()

const router = useRouter()
const route = useRoute() // ← AGREGAR
const authStore = useAuthStore()

const isLoading = ref(true)
const serverErrors = ref<Record<string, string[]>>({})
const showPassword = ref(false)

const { meta, handleSubmit, errors, defineField, setErrors } = useForm({
  validationSchema: loginSchema,
})
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const onSubmit = handleSubmit(async (values) => {
  try {
    useSweetAlert({
      title: 'Iniciando sesión',
      text: 'Espere un momento',
      icon: 'loading',
    })

    // 1. Hacer login
    const response = await authService.login(values as loginDTO)
    // 2. Guardar datos de autenticación Y sincronizar carrito
    await authStore.setAuthData(response.token, response.user)

    Swal.close()

    // ← NUEVA LÓGICA: Leer el redirect de la query
    const redirectTo = route.query.redirect as string

    if (redirectTo && redirectTo !== '/login') {
      // Si hay un redirect específico, ir ahí
      router.push(redirectTo)
    } else {
      // Si no, redirigir según rol
      if (authStore.isAdmin) {
        router.push({ name: 'admin.dashboard' })
      } else {
        router.push({ name: 'shop.home' })
      }
    }
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
  <AuthenticationCard v-else>
    <form action="" method="POST" @submit="onSubmit">
      <div class="mb-4">
        <label for="email" class="block mb-2 font-medium text-gray-700 dark:text-gray-300"
          >Correo Electronico</label
        >
        <input
          v-model="email"
          v-bind="emailAttrs"
          id="email"
          type="email"
          name="email"
          class="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
        />
        <span class="text-red-400">{{ errors.email }}</span>
      </div>

      <div class="mb-6">
        <label for="password" class="block mb-2 font-medium text-gray-700 dark:text-gray-300"
          >Contraseña</label
        >
        <div class="relative">
          <input
            v-model="password"
            v-bind="passwordAttrs"
            id="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            class="mt-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          />
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="absolute right-3 top-5 transform -translate-y-1/2 mt-0.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
          >
            <span v-if="!showPassword">
              <font-awesome-icon icon="fa-solid fa-eye" size="lg" class="text-gray-300" />
            </span>
            <span v-else>
              <font-awesome-icon icon="fa-solid fa-eye-slash" size="lg" class="text-gray-300" />
            </span>
          </button>
        </div>
        <span class="text-red-400">{{ errors.password }}</span>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p class="text-sm text-gray-500 dark:text-gray-500">
          ¿No tienes cuenta?
          <router-link
            :to="{
              name: 'register',
              query: route.query.redirect ? { redirect: route.query.redirect } : {},
            }"
            class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Crear cuenta
          </router-link>
        </p>

        <ButtonAuth name="INICIAR SESIÓN" :disabled="!meta.valid" />
      </div>
    </form>
  </AuthenticationCard>
</template>
