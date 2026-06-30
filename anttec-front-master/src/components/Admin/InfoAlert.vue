<script setup lang="ts">
interface Props {
  message: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="flex items-center p-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400"
    role="alert"
  >
    <font-awesome-icon icon="fa-solid fa-circle-info" size="lg" class="me-4 shrink-0 inline" />
    <span class="sr-only">Info</span>
    <div><span class="font-medium">Alerta Informativa!</span> {{ message }}</div>
  </div>
</template>
