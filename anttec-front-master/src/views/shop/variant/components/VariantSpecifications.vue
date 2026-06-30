<script setup lang="ts">
import type { variantSpecificationsSI } from '@/interfaces/shop/Variant/VariantSpecificationsInterface'

interface Props {
  description: string | null
  specifications: variantSpecificationsSI[]
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
    <!-- Descripción -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
        Descripción
      </h3>
      <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
        {{ description ?? 'No cuenta con una descripción' }}
      </p>
    </div>

    <!-- Especificaciones -->
    <div
      v-if="specifications.length > 0"
      class="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
        Especificaciones
      </h3>
      <dl class="space-y-3">
        <div
          v-for="spec in specifications"
          :key="spec.name"
          class="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
        >
          <dt class="text-gray-600 dark:text-gray-400 font-semibold">{{ spec.name }}</dt>
          <dd class="text-gray-900 dark:text-gray-100 font-medium text-right">{{ spec.value }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>
