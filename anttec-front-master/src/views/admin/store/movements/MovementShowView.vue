<script setup lang="ts">
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import type { movementI } from '@/interfaces/admin/movement/MovementInterface'
import MovementsService from '@/services/admin/MovementsService'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const movementsService = new MovementsService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Movimientos', route: 'admin.store.movements' },
  { name: 'Detalle' },
])

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const movement = ref<movementI | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const loadMovement = async () => {
  try {
    movement.value = await movementsService.getById(id)
  } catch (err) {
    error.value = 'No se pudieron cargar las categorías.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadMovement()
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <section class="mb-8" v-else>
    <h5 class="text-center text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
      Detalles del Movimiento
    </h5>
    <div>
      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Tipo:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ movement?.type }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Razón:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ movement?.reason }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">
          Detalle de transacción:
        </h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">
          {{ movement?.detail_transaction ?? 'No tiene detalle' }}
        </p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Fecha:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ movement?.date }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Hora:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ movement?.time }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium mb-3 text-center">
          Detalles:
        </h6>
        <div v-if="!movement?.variants">
          <p class="text-gray-500 dark:text-gray-300 text-lg whitespace-pre-line">
            No tiene detalle de variantes
          </p>
        </div>
        <div class="w-full flex justify-center" v-else>
          <div class="max-w-md w-full">
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table class="w-full text-left rtl:text-right text-gray-500 dark:text-gray-300">
                <thead
                  class="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300"
                >
                  <tr>
                    <th scope="col" class="px-6 py-3">#</th>
                    <th scope="col" class="px-6 py-3">Producto</th>
                    <th scope="col" class="px-6 py-3">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    :class="[
                      'bg-white dark:bg-gray-800',
                      index != movement?.variants.length - 1
                        ? 'border-b dark:border-gray-700 border-gray-200'
                        : '',
                    ]"
                    v-for="(variant, index) in movement?.variants"
                    :key="index"
                  >
                    <th
                      scope="row"
                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {{ index + 1 }}
                    </th>
                    <td class="px-6 py-4">
                      {{ variant.name }} ({{ variant.model }}) -
                      {{ variant.features.map((f) => f.description).join(' | ') }}
                    </td>
                    <td class="px-6 py-4">
                      {{ variant.quantity }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
