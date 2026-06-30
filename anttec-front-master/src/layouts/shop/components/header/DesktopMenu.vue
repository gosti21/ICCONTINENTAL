<script setup lang="ts">
import type { categorySI } from '@/interfaces/shop/CategorySInterface'

defineProps<{
  categories: categorySI[]
}>()
</script>

<template>
  <section class="bg-gray-100 hidden lg:block">
    <ul class="flex justify-center gap-8 p-2">
      <li v-for="(category, index) in categories" :key="index" class="relative group">
        <!-- Categoría -->
        <router-link
          :to="{ name: 'shop.products.category', params: { categoryId: category.id } }"
          class="uppercase font-medium flex items-center gap-1 hover:text-indigo-600"
        >
          {{ category.name }}
          <font-awesome-icon icon="fa-solid fa-angle-down" />
        </router-link>
        <!-- Subcategorías -->
        <div
          v-if="category.subcategories?.length"
          class="absolute left-0 top-full mt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 bg-gray-200 dark:bg-gray-700 shadow-lg rounded-md min-w-32 z-50"
        >
          <div
            class="absolute -top-2 left-6 w-4 h-4 bg-gray-200 dark:bg-gray-700 rotate-45 [clip-path:polygon(0_0,100%_0,0_100%)]"
          ></div>
          <ul class="py-2">
            <li v-for="sub in category.subcategories" :key="sub.id">
              <router-link
                :to="{
                  name: 'shop.products.category.subcategory',
                  params: { categoryId: category.id, subcategoryId: sub.id },
                }"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-200 dark:hover:bg-gray-300"
              >
                {{ sub.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </section>
</template>
