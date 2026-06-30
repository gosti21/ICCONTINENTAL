<script setup lang="ts">
import type { addressSI } from '@/interfaces/shop/AddressSInterface'

interface Props {
  address: addressSI
  selected?: boolean
  selectable?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false,
  selectable: true,
})

const emit = defineEmits<{
  select: [address: addressSI]
  edit: [address: addressSI]
  delete: [address: addressSI]
  setFavorite: [address: addressSI]
}>()
</script>

<template>
  <div
    class="relative bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 overflow-hidden group"
    :class="[
      selected
        ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20 ring-2 ring-blue-100 dark:ring-blue-900'
        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md',
      selectable && 'cursor-pointer',
    ]"
    @click="selectable && emit('select', address)"
  >
    <!-- Indicador de seleccionada -->
    <div
      v-if="selected"
      class="absolute top-3 left-3 z-10 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg"
    >
      <font-awesome-icon icon="fa-solid fa-circle-check" class="text-white" />
    </div>

    <!-- Contenido principal -->
    <div class="px-5 py-3">
      <!-- Dirección -->
      <div class="flex justify-between">
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0"
          >
            <font-awesome-icon
              icon="fa-solid fa-location-dot"
              class="text-blue-600 dark:text-blue-400 text-2xl"
            />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
              {{ address.street }} #{{ address.street_number }} -
              <span>{{ address.district }}, {{ address.department }}</span>
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <span>Referencia:</span> {{ address.reference }}
            </p>

            <!-- Precio de envío -->
            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center gap-2">
                <font-awesome-icon
                  icon="fa-solid fa-truck-fast"
                  class="text-blue-600 dark:text-blue-400"
                />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Costo de envío
                </span>
              </div>
              <span
                class="text-base font-bold ml-5"
                :class="
                  address.delivery_price === 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                "
              >
                {{ address.delivery_price === 0 ? 'GRATIS' : `S/ ${address.delivery_price}` }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button
            class="cursor-pointer disabled:cursor-default"
            :disabled="address.favorite"
            @click.stop="emit('setFavorite', address)"
          >
            <font-awesome-icon
              icon="fa-solid fa-star"
              class="hover:text-yellow-300"
              :class="address.favorite ? 'text-yellow-300' : 'text-gray-300 dark:text-gray-300'"
            />
          </button>
          <button @click.stop="emit('edit', address)" class="cursor-pointer">
            <font-awesome-icon
              icon="fa-solid fa-pen"
              class="text-gray-300 dark:text-gray-300 hover:text-fg-yellow"
            />
          </button>
          <button @click.stop="emit('delete', address)" class="cursor-pointer">
            <font-awesome-icon
              icon="fa-solid fa-trash-can"
              class="text-gray-300 dark:text-gray-300 hover:text-red-400"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay de selección -->
    <div
      v-if="selected"
      class="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/5 pointer-events-none"
    ></div>
  </div>
</template>
