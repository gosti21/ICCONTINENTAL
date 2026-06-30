<script setup lang="ts">
import { useClickOutside } from '@/composables/useClickOutside'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'
import { computed, ref } from 'vue'
import type { adminMenuInterface } from '../interface/adminMenuInterface'
import { useSweetAlert } from '@/composables/useSweetAlert'
import AuthService from '@/services/auth/AuthService'
import Swal from 'sweetalert2'
import router from '@/router'

const authService = new AuthService()

const ui = useUIStore()
const toggleMenu = ui.toggleMenu

const menuRef = ref(null)
useClickOutside(
  menuRef,
  () => {
    ui.isMenuOpen = false
  },
  computed(() => ui.isMenuOpen),
)

const links: adminMenuInterface[] = [
  {
    name: 'Tienda virtual',
    route: 'shop.home',
  },
  {
    name: 'Cerrar sesión',
    action: 'logout',
  },
]
const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    useSweetAlert({
      title: 'Cerrando sesión',
      text: 'Espere un momento',
      icon: 'loading',
    })

    await authService.logout()
    ui.isMenuOpen = false
    Swal.close()
    await router.push({ name: 'shop.home' })
  } catch (err) {
    console.error('Error al cerrar sesión:', err)
  }
}
</script>

<template>
  <div class="flex items-center">
    <div class="flex items-center ms-3">
      <div>
        <button
          ref="menuRef"
          type="button"
          class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
          @click="toggleMenu()"
          aria-expanded="false"
        >
          <span class="sr-only">Open user menu</span>
          <img
            class="w-8 h-8 rounded-full"
            src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
            alt="user photo"
          />
        </button>
      </div>
      <div
        class="z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600"
        :class="
          ui.isMenuOpen
            ? 'block absolute -top-4 right-23 m-0 translate-x-20 translate-y-14.5'
            : 'hidden'
        "
      >
        <div class="px-4 py-3" role="none">
          <p class="text-sm text-gray-900 dark:text-white" role="none">
            {{ authStore.user?.name }}
          </p>
        </div>
        <ul class="py-1" role="none">
          <li v-for="link in links" :key="link.name">
            <router-link
              v-if="link.route"
              :to="{ name: link.route }"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
              role="menuitem"
            >
              {{ link.name }}
            </router-link>
            <button
              v-else-if="link.action === 'logout'"
              @click="handleLogout"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
              role="menuitem"
            >
              {{ link.name }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
