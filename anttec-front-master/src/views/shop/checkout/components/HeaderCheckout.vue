<script setup lang="ts">
import logo from '@/assets/img/logo.png'
</script>

<template>
  <div class="sticky top-0 z-50">
    <div class="relative">
      <header class="bg-black shadow-md dark:bg-banner">
        <div class="container lg:mx-auto max-w-8xl mx-auto px-6 lg:px-8">
          <div class="flex items-center justify-between py-3 sm:py-4">
            <!-- Logo + Home -->
            <router-link :to="{ name: 'shop.home' }" class="flex items-center">
              <img class="h-12" :src="logo" alt="Logo Tienda" />
            </router-link>

            <!-- Navegación y acciones -->
            <nav
              class="flex items-center space-x-2 md:space-x-5 lg:md:space-x-8 text-gray-700 dark:text-gray-200"
            >
              <!-- Contacto -->
              <div
                class="flex flex-col sm:flex-row text-center gap-1 sm:gap-3 text-sm sm:text-base"
              >
                <span class="text-gray-300">¿Necesitas ayuda para comprar?</span>
                <a href="https://wa.me/51964645037" target="__blank" class="hover:underline">
                  <span class="font-bold text-gray-200">964 645 037</span>
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </div>
  </div>
</template>
