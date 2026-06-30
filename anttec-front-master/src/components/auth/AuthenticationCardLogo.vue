<script setup lang="ts">
import logo from '@/assets/img/logo.png'
import logoDark from '@/assets/img/logo-dark.png'
</script>

<template>
  <router-link :to="{ name: 'shop.home' }">
    <!-- Imagen para modo claro -->
    <img class="w-40 h-16 block dark:hidden" :src="logoDark" alt="Logo Light" />
    <!-- Imagen para modo oscuro -->
    <img class="w-40 h-16 hidden dark:block" :src="logo" alt="Logo Dark" />
  </router-link>
</template>
