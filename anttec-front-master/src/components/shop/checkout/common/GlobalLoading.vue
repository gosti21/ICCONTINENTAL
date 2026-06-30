<!-- src/components/common/GlobalLoading.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)

router.beforeEach((to) => {
  // ✅ Solo activar en rutas que tengan meta.showGlobalLoading
  if (to.meta.showGlobalLoading) {
    isLoading.value = true
  }
})

router.afterEach((to) => {
  if (to.meta.showGlobalLoading) {
    setTimeout(() => {
      isLoading.value = false
    }, 200)
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-white dark:bg-gray-950 z-9999 flex items-center justify-center"
    >
      <div class="text-center">
        <div class="relative w-20 h-20 mx-auto mb-4">
          <div
            class="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"
          ></div>
          <div
            class="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"
          ></div>
        </div>
        <p class="text-gray-600 dark:text-gray-400 font-medium">Cargando...</p>
      </div>
    </div>
  </Transition>
</template>
