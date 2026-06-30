<script setup lang="ts">
import type { branchSI } from '@/interfaces/shop/BranchSInterface'

interface Props {
  branch: branchSI
  selected?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false,
})

const emit = defineEmits<{
  select: [branch: branchSI]
}>()
</script>

<template>
  <div
    class="relative bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 overflow-hidden cursor-pointer group"
    :class="[
      selected
        ? 'border-green-500 dark:border-green-400 shadow-lg shadow-green-500/20 ring-1 ring-green-100 dark:ring-green-900'
        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md',
    ]"
    @click="emit('select', branch)"
  >
    <!-- Indicador de seleccionada -->
    <div
      v-if="selected"
      class="absolute top-3 right-2 z-10 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg"
    >
      <font-awesome-icon icon="fa-solid fa-circle-check" class="text-white" />
    </div>

    <!-- Badge de recojo gratis -->
    <div
      class="absolute top-0 left-0 bg-linear-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-br-xl shadow-lg"
    >
      Recojo GRATIS
    </div>

    <!-- Contenido principal -->
    <div class="p-5 pt-10">
      <!-- Icono de tienda y nombre -->
      <div class="flex items-start gap-3 mb-3">
        <div
          class="w-16 h-16 bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl flex items-center justify-center shrink-0 shadow-md"
        >
          <font-awesome-icon
            icon="fa-solid fa-shop"
            class="text-2xl text-green-600 dark:text-green-400"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
            {{ branch.name }}
          </h3>
          <!-- Dirección completa integrada -->
          <div class="space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-start gap-2">
              <font-awesome-icon
                icon="fa-solid fa-location-dot"
                class="text-gray-400 mt-0.5 shrink-0 text-xs"
              />
              <p class="leading-snug">{{ branch.address.street }}, {{ branch.address.district }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Horario de atención compacto -->
      <div class="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p v-if="branch.address.reference" class="text-xs text-gray-500 dark:text-gray-400">
            <span>Referencia:</span> {{ branch.address.reference }}
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <font-awesome-icon icon="fa-solid fa-clock" class="text-gray-400 shrink-0" />
          <span class="font-medium">Lun-Sáb 9:30AM-8PM</span>
        </div>
      </div>
    </div>

    <!-- Overlay de selección -->
    <div
      v-if="selected"
      class="absolute inset-0 bg-green-600/5 dark:bg-green-400/5 pointer-events-none"
    ></div>
  </div>
</template>
