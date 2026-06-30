<script setup lang="ts">
import logo from '@/assets/img/logo.png'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { categorySI } from '@/interfaces/shop/CategorySInterface'
import CategorySService from '@/services/shop/CategorySService'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import SearchBar from './header/SearchBar.vue'
import ProfileMenu from './header/ProfileMenu.vue'
import CartButton from './header/CartButton.vue'
import MobileDrawer from './header/MobileDrawer.vue'
import DesktopMenu from './header/DesktopMenu.vue'
import CartDrawer from '@/components/shop/cart/CartDrawer.vue'

const categorySService = new CategorySService()

const isCategoriesOpen = ref(false)
const categoriesRef = ref<HTMLElement | null>(null)

const toggleCategories = () => {
  isCategoriesOpen.value = !isCategoriesOpen.value
  if (!isCategoriesOpen.value) {
    activeCategory.value = null
  }
}

const categories = ref<categorySI[] | null>(null)
const error = ref<string | null>(null)
const categoriesList = computed(() => categories.value ?? [])

const activeCategory = ref<categorySI | null>(null)

const openCategory = (category: categorySI) => {
  activeCategory.value = category
}

const backToCategories = () => {
  activeCategory.value = null
}

const loadCategories = async () => {
  try {
    categories.value = await categorySService.getAll()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las categorías.'
    console.error(err)
  }
}

const handleResize = () => {
  if (window.innerWidth >= 1024) {
    isCategoriesOpen.value = false
    activeCategory.value = null
  }
}

onMounted(() => {
  loadCategories()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

watch(isCategoriesOpen, (open) => {
  document.body.classList.toggle('overflow-hidden', open)
})
</script>

<template>
  <div class="sticky top-0 z-50">
    <div class="relative">
      <header class="bg-black shadow-md dark:bg-banner">
        <div class="container lg:mx-auto max-w-8xl mx-auto px-6 lg:px-8">
          <div class="flex items-center justify-between py-3 sm:py-4">
            <!-- Toggle categorías (mobile / tablet) -->
            <div class="lg:hidden" ref="categoriesRef">
              <button class="lg:hidden text-gray-200 mr-3" @click="toggleCategories">
                <font-awesome-icon icon="fa-solid fa-bars" size="2xl" />
              </button>
            </div>

            <!-- Logo + Home -->
            <router-link :to="{ name: 'shop.home' }" class="flex items-center">
              <img class="h-12" :src="logo" alt="Logo Tienda" />
            </router-link>

            <!-- Search bar desktop -->
            <div class="flex-1 hidden sm:flex justify-center px-6">
              <SearchBar />
            </div>

            <!-- Navegación y acciones -->
            <nav
              class="flex items-center space-x-2 md:space-x-5 lg:md:space-x-8 text-gray-700 dark:text-gray-200"
            >
              <!-- Contacto -->
              <div class="hidden md:flex flex-col text-center">
                <span class="text-gray-300">Contáctanos</span>
                <a href="https://wa.me/51964645037" target="__blank" class="hover:underline">
                  <span class="font-bold text-gray-200">964 645 037</span>
                </a>
              </div>

              <!-- Perfil -->
              <ProfileMenu />

              <!-- Carrito -->
              <CartButton />
            </nav>
          </div>

          <!-- Search bar mobile -->
          <div class="block sm:hidden pb-3">
            <SearchBar is-mobile />
          </div>
        </div>
      </header>

      <!-- Mobile Drawer -->
      <MobileDrawer
        :is-open="isCategoriesOpen"
        :categories="categoriesList"
        :active-category="activeCategory"
        @close="toggleCategories"
        @open-category="openCategory"
        @back="backToCategories"
      />
    </div>

    <!-- Desktop Menu -->
    <DesktopMenu :categories="categoriesList" />
    <CartDrawer />
  </div>
</template>
