<script setup lang="ts">
import type { categorySI } from '@/interfaces/shop/CategorySInterface'

defineProps<{
  isOpen: boolean
  categories: categorySI[]
  activeCategory: categorySI | null
}>()

const emit = defineEmits<{
  close: []
  openCategory: [category: categorySI]
  back: []
}>()
</script>

<template>
  <!-- OVERLAY -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-30 lg:hidden" @click="emit('close')"></div>

  <!-- DRAWER -->
  <div
    v-if="isOpen"
    class="lg:hidden fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg z-40 transition-transform duration-300 overflow-y-auto"
  >
    <!-- Header del drawer -->
    <div class="bg-black dark:bg-banner p-4 flex items-center justify-between">
      <!-- Si hay categoría activa: mostrar con link y hover -->
      <h3 v-if="activeCategory" class="text-white font-semibold text-lg uppercase hover:underline">
        <router-link
          :to="{ name: 'shop.products.category', params: { categoryId: activeCategory.id } }"
          @click="emit('close')"
        >
          {{ activeCategory.name }}
        </router-link>
      </h3>

      <!-- Si NO hay categoría activa: solo texto, sin link ni hover -->
      <h3 v-else class="text-white font-semibold text-lg uppercase">Categorías</h3>
      <button @click="emit('close')" class="text-white cursor-pointer">
        <font-awesome-icon icon="fa-solid fa-xmark" size="xl" />
      </button>
    </div>

    <!-- Botón de regreso cuando hay una subcategoría activa -->
    <div v-if="activeCategory" class="border-b border-gray-200 dark:border-gray-700">
      <button
        @click="emit('back')"
        class="w-full flex items-center gap-2 px-4 py-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
      >
        <font-awesome-icon icon="fa-solid fa-angle-left" class="dark:text-gray-200" />
        <span class="font-medium dark:text-gray-200">Atrás</span>
      </button>
    </div>

    <!-- CATEGORÍAS -->
    <ul v-if="!activeCategory" class="divide-y divide-gray-200 dark:divide-gray-600">
      <li
        v-for="category in categories"
        :key="category.id"
        class="dark:text-gray-300 flex justify-between items-center px-4 py-4 uppercase font-medium cursor-pointer hover:bg-gray-100 hover:dark:text-gray-50 dark:hover:bg-gray-700 transition"
        @click="emit('openCategory', category)"
      >
        <span>{{ category.name }}</span>
        <font-awesome-icon icon="fa-solid fa-angle-right" class="text-gray-400" />
      </li>
    </ul>

    <!-- SUBCATEGORÍAS -->
    <div v-else>
      <ul class="divide-y divide-gray-200 dark:divide-gray-700">
        <li v-for="sub in activeCategory.subcategories" :key="sub.id">
          <router-link
            :to="{
              name: 'shop.products.category.subcategory',
              params: { categoryId: activeCategory.id, subcategoryId: sub.id },
            }"
            class="block px-4 py-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            @click="emit('close')"
          >
            {{ sub.name }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
