<script setup lang="ts">
import logoDark from '@/assets/img/logo-dark.png'
import logo from '@/assets/img/logo.png'
import { useClickOutside } from '@/composables/useClickOutside'
import AdminMenu from '@/layouts/admin/components/AdminMenu.vue'
import { useUIStore } from '@/stores/useUIStore'
import { computed, ref } from 'vue'

const ui = useUIStore()
const toggleSidebar = ui.toggleSidebar

const asideRef = ref(null)
useClickOutside(
  asideRef,
  () => {
    ui.isSidebarOpen = false
  },
  computed(() => ui.isSidebarOpen),
)
</script>

<template>
  <nav
    class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start rtl:justify-end">
          <button
            ref="asideRef"
            @click="toggleSidebar()"
            type="button"
            class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 cursor-pointer"
          >
            <span class="sr-only">Open sidebar</span>
            <font-awesome-icon icon="fa-solid fa-bars-staggered" size="xl" />
          </button>
          <router-link :to="{ name: 'admin.dashboard' }" class="flex ms-2 md:me-24">
            <!-- Imagen para modo claro -->
            <img class="h-10 me-3 block dark:hidden" :src="logoDark" alt="Logo Light" />
            <!-- Imagen para modo oscuro -->
            <img class="h-10 me-3 hidden dark:block" :src="logo" alt="Logo Dark" />
          </router-link>
        </div>
        <AdminMenu />
      </div>
    </div>
  </nav>
</template>
