<script setup lang="ts">
interface Props {
  status: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:status'): void
}>()

const onToggle = (e: Event) => {
  e.preventDefault()
  emit('update:status')
}
</script>

<template>
  <label class="inline-flex items-center cursor-pointer">
    <input type="checkbox" value="" class="sr-only peer" :checked="status" @click="onToggle" />
    <div
      class="relative w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-700 dark:peer-checked:bg-purple-700"
    ></div>
  </label>
</template>
