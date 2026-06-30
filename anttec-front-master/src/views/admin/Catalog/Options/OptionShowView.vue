<script setup lang="ts">
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import type { OptionExtendI } from '@/interfaces/admin/options/OptionInterface'
import OptionService from '@/services/admin/OptionService'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const optionService = new OptionService()

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const option = ref<OptionExtendI | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Opciones', route: 'admin.catalog.options' },
  { name: option.value ? `Detalle - ${option.value.name}` : 'Detalle' },
])

const loadOption = async () => {
  try {
    option.value = await optionService.getById(id)
  } catch (err) {
    error.value = 'No se pudieron cargar las categorías.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadOption()
})
</script>
<template>
  <AnimationLoader v-if="isLoading" />
  <section class="mb-8" v-else>
    <h5 class="text-center text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
      Detalles de la Opción
    </h5>
    <div>
      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Nombre:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ option?.name }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Tipo:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ option?.type }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium mb-3 text-center">
          Valores:
        </h6>
        <div v-if="!option?.option_values">
          <p class="text-gray-500 dark:text-gray-300 text-lg whitespace-pre-line">
            No tiene valores asociados
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
                    <th scope="col" class="px-6 py-3">Valor</th>
                    <th scope="col" class="px-6 py-3">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    :class="[
                      'bg-white dark:bg-gray-800',
                      index != option?.option_values.length - 1
                        ? 'border-b dark:border-gray-700 border-gray-200'
                        : '',
                    ]"
                    v-for="(values, index) in option?.option_values"
                    :key="index"
                  >
                    <td class="px-6 py-4" v-if="option.type === 'text'">
                      {{ values.value }}
                    </td>
                    <td class="px-6 py-4" v-else>
                      <div
                        class="w-6 h-6 rounded-full border"
                        :style="{ backgroundColor: values.value }"
                      ></div>
                    </td>
                    <td class="px-6 py-4">
                      {{ values.description }}
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
