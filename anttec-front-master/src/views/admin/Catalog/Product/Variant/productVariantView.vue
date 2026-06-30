<script setup lang="ts">
import noImg from '@/assets/img/no-image.jpg'
import BadgeStatus from '@/components/Admin/BadgeStatus.vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import type { variantShortsI } from '@/interfaces/admin/variant/variantShortInterface'
import { computed, ref } from 'vue'

interface Props {
  variants: variantShortsI | null
}

const props = defineProps<Props>()

const variantsList = computed(() => props.variants?.data ?? [])
const loadedImages = ref<Record<number, boolean>>({})
</script>

<template>
  <section class="mb-8">
    <h5 class="text-center text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
      Variantes del Producto:
    </h5>

    <div v-if="variantsList.length > 0" class="space-y-3">
      <div
        v-for="(variant, index) in variantsList"
        :key="index"
        class="block border rounded-lg shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <div class="p-3">
          <div class="py-2 flex items-center gap-4 justify-between">
            <div class="flex items-center gap-4">
              <div class="relative w-20 h-20">
                <!-- Skeleton -->
                <div
                  v-if="!loadedImages[index]"
                  role="status"
                  class="absolute inset-0 flex items-center justify-center bg-neutral-quaternary rounded animate-pulse"
                >
                  <img
                    :src="noImg"
                    alt="Cargando imagen"
                    class="w-10 h-10 object-contain opacity-60"
                  />
                  <span class="sr-only">Loading...</span>
                </div>

                <!-- Imagen -->
                <img
                  :src="variant.img[0]?.url ?? noImg"
                  alt="Imagen de la variante"
                  class="w-20 h-20 object-cover rounded"
                  @load="loadedImages[index] = true"
                  @error="loadedImages[index] = true"
                />
              </div>
              <div class="px-2">
                <p class="text-gray-500 dark:text-gray-400">SKU: {{ variant.sku }}</p>
                <p class="font-medium text-gray-800 dark:text-gray-100 mt-2">
                  {{ variant.features.map((f) => f.description).join(' | ') }}
                </p>
              </div>
            </div>

            <!-- Badge de status -->
            <BadgeStatus :status="variant.status" />
          </div>
        </div>
      </div>
    </div>
    <InfoAlert
      v-else
      message="Este producto todavía no tiene variantes. Primero asocie las opciones correspondientes y luego cree las variantes."
    />
  </section>
</template>
