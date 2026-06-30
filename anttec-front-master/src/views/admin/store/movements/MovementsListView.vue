<script setup lang="ts">
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { movementsShortI } from '@/interfaces/admin/movement/MovementShortInterface'
import MovementsService from '@/services/admin/MovementsService'
import { computed, onMounted, ref } from 'vue'
import PaginationControls from '@/components/Admin/PaginationControls.vue'

const movementsService = new MovementsService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Movimientos' }])

const movements = ref<movementsShortI | null>(null)
const error = ref<string | null>(null)
const movementsList = computed(() => movements.value?.data ?? [])
const isLoading = ref(true)

// ✅ NUEVO: Estados de paginación
const currentPage = ref(1)
const perPage = ref(15)

// ✅ NUEVO: Función para calcular el índice global
const getGlobalIndex = (localIndex: number) => {
  return (currentPage.value - 1) * perPage.value + localIndex + 1
}

const loadMovements = async () => {
  try {
    isLoading.value = true
    movements.value = await movementsService.getAll(currentPage.value, perPage.value)
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar los movimientos.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// ✅ NUEVO: Handlers de paginación
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadMovements()
}

const handlePerPageChange = (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  loadMovements()
}

onMounted(() => {
  loadMovements()
})
</script>

<template>
  <div class="flex justify-end">
    <router-link
      :to="{ name: 'admin.store.movements.create' }"
      class="mb-3 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
    >
      Registrar
    </router-link>
  </div>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="movementsList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">Tipo</th>
            <th scope="col" class="px-6 py-3">Razón</th>
            <th scope="col" class="px-6 py-3">Fecha</th>
            <th scope="col" class="px-6 py-3">Hora</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != movementsList.length - 1
                ? 'border-b dark:border-gray-700 border-gray-200'
                : '',
            ]"
            v-for="(movement, index) in movementsList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ getGlobalIndex(index) }}
            </th>
            <td class="px-6 py-4">
              {{ movement.type }}
            </td>
            <td class="px-6 py-4 truncate">
              {{ movement.reason }}
            </td>
            <td class="px-6 py-4 truncate">
              {{ movement.date }}
            </td>
            <td class="px-6 py-4 truncate">
              {{ movement.time }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-around">
                <router-link
                  :to="{ name: 'admin.store.movements.show', params: { id: movement.id } }"
                >
                  <font-awesome-icon icon="fa-solid fa-eye" size="xl" class="text-green-400" />
                </router-link>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- ✅ NUEVO: Componente de paginación -->
      <PaginationControls
        v-if="movements?.meta"
        :meta="movements.meta"
        :per-page="perPage"
        @update:page="handlePageChange"
        @update:per-page="handlePerPageChange"
      />
  </div>
  <InfoAlert v-else message="Todavía no hay movimientos registrados" />
</template>
