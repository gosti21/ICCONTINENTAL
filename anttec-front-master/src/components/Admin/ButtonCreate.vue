<script setup lang="ts">
interface Props {
  route: string
}

defineProps<Props>()
</script>

<template>
  <router-link
    :to="{ name: route }"
    class="mb-3 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
  >
    Crear
  </router-link>
</template>
