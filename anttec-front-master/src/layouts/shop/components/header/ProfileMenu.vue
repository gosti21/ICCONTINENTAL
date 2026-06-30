<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useClickOutside } from '@/composables/useClickOutside'
import { useSweetAlert } from '@/composables/useSweetAlert'
import { useAuthStore } from '@/stores/useAuthStore'
import type { profileMenuInterface } from '../../interface/profileMenuInterface'

const router = useRouter()
const authStore = useAuthStore()

const profileRef = ref<HTMLElement | null>(null)
const isProfileOpen = ref(false)

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value
}

const links: profileMenuInterface = {
  loggedIn: [
    {
      name: 'Admin',
      route: 'admin.dashboard',
      roles: ['admin'], // ← AÑADIR ESTO
    },
    {
      name: 'Cerrar sesión',
      action: 'logout',
    },
  ],
  notLoggedIn: [
    {
      name: 'Iniciar sesión',
      route: 'login',
    },
    {
      name: 'Crear cuenta',
      route: 'register',
    },
  ],
}

// ✅ Computed que filtra por roles
const currentLinks = computed(() => {
  if (!authStore.isAuthenticated()) {
    return links.notLoggedIn
  }

  // Filtrar links según roles del usuario
  return links.loggedIn.filter((link) => {
    // Si no tiene roles definidos, mostrarlo siempre
    if (!link.roles) return true

    // Si tiene roles, verificar que el usuario tenga al menos uno
    return link.roles.some((role) => authStore.hasRole(role))
  })
})

const handleLogout = async () => {
  try {
    useSweetAlert({
      title: 'Cerrando sesión',
      text: 'Espere un momento',
      icon: 'loading',
    })

    await authStore.logout()
    isProfileOpen.value = false
    Swal.close()
    await router.push({ name: 'shop.home' })
  } catch (err) {
    console.error('Error al cerrar sesión:', err)
    useSweetAlert({
      title: 'Error',
      text: 'No se pudo cerrar sesión',
      icon: 'error',
      timer: 3000,
    })
  }
}

const handleAction = (action: string) => {
  if (action === 'logout') {
    handleLogout()
  }
}

useClickOutside(
  profileRef,
  () => {
    isProfileOpen.value = false
  },
  isProfileOpen,
)
</script>

<template>
  <div class="relative" ref="profileRef">
    <button
      class="flex items-center space-x-1 hover:underline cursor-pointer"
      @click="toggleProfile"
    >
      <!-- Desktop (md+) -->
      <div class="hidden md:inline">
        <span v-if="authStore.user?.name" class="mr-1"> Hola, {{ authStore.user.name }} </span>
        <span v-else>Hola, Inicia Sesión</span>
        <font-awesome-icon icon="fa-solid fa-angle-down" />
      </div>

      <!-- Mobile -->
      <div class="block md:hidden">
        <font-awesome-icon icon="fa-solid fa-user" class="text-3xl text-gray-200" />
      </div>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isProfileOpen"
      class="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 min-w-40 overflow-hidden"
    >
      <!-- Header del menú (solo si está autenticado) -->
      <div
        v-if="authStore.user?.name"
        class="px-4 py-3 border-b border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm font-medium text-gray-900 dark:text-white">
          {{ authStore.user.name }}
        </p>
        <p v-if="authStore.user.email" class="text-xs text-gray-500 dark:text-gray-400 truncate">
          {{ authStore.user.email }}
        </p>
      </div>

      <!-- Links dinámicos -->
      <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
        <li v-for="link in currentLinks" :key="link.name">
          <!-- Si tiene route, es un router-link -->
          <router-link
            v-if="link.route"
            :to="{ name: link.route }"
            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            @click="isProfileOpen = false"
          >
            {{ link.name }}
          </router-link>

          <!-- Si tiene action, es un button -->
          <button
            v-else-if="link.action"
            @click="handleAction(link.action)"
            class="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            {{ link.name }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
