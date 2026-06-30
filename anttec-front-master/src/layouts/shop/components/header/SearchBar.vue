<script setup lang="ts">
defineProps<{
  isMobile?: boolean
}>()
</script>

<template>
  <div class="relative" :class="isMobile ? 'w-full' : 'w-full max-w-2xl'">
    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
      <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="text-gray-400" />
    </div>
    <input
      type="search"
      placeholder="Buscar productos..."
      class="w-full border border-gray-300 rounded-lg ps-11 pe-4 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
</template>
