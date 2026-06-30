<script setup lang="ts">
import AuthenticationCardLogo from './AuthenticationCardLogo.vue'
</script>

<template>
  <div
    class="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900 mx-4 md:mx-0"
  >
    <div>
      <AuthenticationCardLogo />
    </div>
    <div
      class="w-full sm:max-w-md mt-6 px-6 py-6 bg-white dark:bg-gray-800 shadow-md overflow-hidden rounded-lg"
    >
      <slot />
    </div>
  </div>
</template>
