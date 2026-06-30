<script setup lang="ts">
interface Props {
  status: boolean
}

defineProps<Props>()
</script>

<template>
  <span
    v-if="status === true"
    class="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-300"
  >
    Activo
  </span>
  <span
    v-else
    class="bg-red-100 text-red-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-red-900 dark:text-red-300"
    >Inactivo</span
  >
</template>
