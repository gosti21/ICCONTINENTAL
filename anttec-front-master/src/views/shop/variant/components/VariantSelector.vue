<script setup lang="ts">
import type { featuresSI } from '@/interfaces/shop/Variant/selectedVariantInterface'

interface Props {
  groupedFeatures: Record<string, featuresSI[]>
  selectedFeatures: featuresSI[]
  isFeatureSelected: (featureId: number) => boolean
  isFeatureAvailable: (featureId: number, optionName: string) => boolean
}

defineProps<Props>()

const emit = defineEmits<{
  selectFeature: [featureId: number, optionName: string]
}>()

const handleSelectFeature = (featureId: number, optionName: string) => {
  emit('selectFeature', featureId, optionName)
}
</script>

<template>
  <div v-for="(features, optionName) in groupedFeatures" :key="optionName" class="space-y-3">
    <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
      {{ optionName }}
    </h3>

    <div class="flex flex-wrap gap-4">
      <!-- Features tipo COLOR -->
      <template v-for="feature in features" :key="`color-${feature.id}`">
        <button
          v-if="feature.type === 'color'"
          @click="handleSelectFeature(feature.id, optionName)"
          :disabled="!isFeatureAvailable(feature.id, optionName)"
          class="group relative w-11 h-11 rounded-full border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-md hover:shadow-lg"
          :class="[
            isFeatureSelected(feature.id)
              ? 'border-blue-600 dark:border-blue-400 ring-4 ring-blue-600/30 dark:ring-blue-400/30 scale-110'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:scale-105',
          ]"
          :style="{ backgroundColor: feature.value }"
          :title="feature.description"
        >
          <span
            v-if="isFeatureSelected(feature.id)"
            class="absolute inset-0 flex items-center justify-center"
          >
            <svg class="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </button>
      </template>

      <!-- Features tipo TEXT -->
      <template v-for="feature in features" :key="`text-${feature.id}`">
        <button
          v-if="feature.type !== 'color'"
          @click="handleSelectFeature(feature.id, optionName)"
          :disabled="!isFeatureAvailable(feature.id, optionName)"
          class="px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md"
          :class="[
            isFeatureSelected(feature.id)
              ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500',
          ]"
        >
          {{ feature.value }}
        </button>
      </template>
    </div>
  </div>
</template>
