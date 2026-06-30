import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isSidebarOpen = ref(false)
  const isMenuOpen = ref(false)

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
  }

  return {
    isSidebarOpen,
    toggleSidebar,
    isMenuOpen,
    toggleMenu,
  }
})
