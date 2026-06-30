<script setup lang="ts">

import type { paginationMetaI } from '@/interfaces/admin/base/PaginationInterface'
import { computed } from 'vue'

interface Props {
  meta: paginationMetaI
  perPage: number
}

interface Emits {
  (e: 'update:page', page: number): void
  (e: 'update:perPage', perPage: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const perPageOptions = [5, 10, 15, 20, 25, 50]

const canGoPrevious = computed(() => props.meta.current_page > 1)
const canGoNext = computed(() => props.meta.current_page < props.meta.last_page)

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.meta.last_page) {
    emit('update:page', page)
  }
}

const changePerPage = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:perPage', parseInt(target.value))
  emit('update:page', 1) // Resetear a página 1 al cambiar items por página
}
</script>

<template>
  <nav aria-label="Paginación" class="mt-4">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Información de registros -->
      <div class="text-sm text-gray-700 dark:text-gray-400">
        Mostrando <span class="font-semibold text-gray-900 dark:text-white">{{ meta.from }}</span>
        a <span class="font-semibold text-gray-900 dark:text-white">{{ meta.to }}</span>
        de <span class="font-semibold text-gray-900 dark:text-white">{{ meta.total }}</span> registros
      </div>

      <!-- Controles de paginación -->
      <div class="flex items-center space-x-3">
        <!-- Selector de items por página -->
        <label for="per-page-select" class="sr-only">Items por página</label>
        <select
          id="per-page-select"
          :value="perPage"
          @change="changePerPage"
          class="block w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 shadow-sm cursor-pointer"
        >
          <option v-for="option in perPageOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>

        <!-- Indicador de página actual / total -->
        <input
          type="text"
          :value="`Pág. ${meta.current_page} de ${meta.last_page}`"
          class="bg-gray-50 dark:bg-gray-800 w-32 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 text-sm rounded-lg text-center px-2.5 py-2 shadow-sm cursor-default"
          disabled
          readonly
        />

        <!-- Botones de navegación -->
        <div class="inline-flex rounded-lg shadow-sm" role="group">
          <!-- Botón Anterior -->
          <button
            @click="goToPage(meta.current_page - 1)"
            :disabled="!canGoPrevious"
            type="button"
            class="inline-flex items-center justify-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-s-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:outline-none w-9 h-9 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Página anterior"
          >
            <svg
              class="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m15 19-7-7 7-7"
              />
            </svg>
          </button>

          <!-- Botón Siguiente -->
          <button
            @click="goToPage(meta.current_page + 1)"
            :disabled="!canGoNext"
            type="button"
            class="inline-flex items-center justify-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-e-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:outline-none w-9 h-9 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Página siguiente"
          >
            <svg
              class="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m9 5 7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
