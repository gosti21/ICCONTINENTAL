<script setup lang="ts">
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { OptionProductI } from '@/interfaces/admin/optionProduct/OptionProductInterface'
import ProductService from '@/services/admin/ProductService'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import associateCreateModal from './associateCreateModal.vue'
import addValue from './addValue.vue'

const productService = new ProductService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Productos', route: 'admin.catalog.products' },
  { name: 'Detalle', route: 'admin.catalog.products.show' },
  { name: 'Opciones' },
])

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const options = ref<OptionProductI[]>([])
const optionsList = computed(() => options.value ?? [])
const isLoading = ref(true)
const error = ref<string | null>(null)

const modalRef = ref<InstanceType<typeof associateCreateModal> | null>(null)
const openModal = () => {
  modalRef.value?.open()
}

const loadProductOption = async () => {
  try {
    options.value = await productService.getOptions(id)
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las opciones asociadas.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadProductOption()
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <section v-else>
    <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium mb-4 text-center">
      Asociar Opciones
    </h6>
    <div>
      <section
        class="block border rounded-lg shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <header class="border-b px-6 py-2 border-gray-300 dark:border-gray-500">
          <div class="flex justify-between">
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Opciones</h1>

            <button @click="openModal" class="bg-blue-600 text-white px-4 py-2 rounded">
              Agregar
            </button>
            <associateCreateModal ref="modalRef" :product-id="id" @created="loadProductOption" />
          </div>
        </header>

        <div class="p-6">
          <div v-if="options.length > 0">
            <div class="space-y-6">
              <div
                v-for="option in optionsList"
                :key="option.id"
                class="p-6 rounded-lg border border-gray-300 dark:border-gray-500 relative"
              >
                <div class="absolute -top-3 bg-white dark:bg-gray-800">
                  <span class="text-gray-500 dark:text-gray-400 px-3">
                    {{ option.option_name }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-2 mb-4">
                  <div v-for="value in option.values" :key="value.id">
                    <div v-if="option.option_type === 'text'">
                      <span
                        class="bg-gray-100 text-gray-800 text-sm font-medium me-2 pl-2.5 pr-2 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300"
                      >
                        {{ value.description }}
                      </span>
                    </div>
                    <div v-else class="relative inline-flex flex-col items-center">
                      <span
                        class="inline-block h-6 w-6 shadow-lg rounded-full border-2 border-gray-300 dark:border-gray-500"
                        :style="{ backgroundColor: value.value }"
                      ></span>

                      <span
                        class="mt-2 text-xs bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300 text-center"
                      >
                        {{ value.description }}
                      </span>
                    </div>
                  </div>
                </div>
                <addValue
                  :option_id="option.option_id"
                  :option_product="option.id"
                  @created="loadProductOption"
                />
              </div>
            </div>
          </div>
          <InfoAlert v-else message="Este producto, aún no tiene asociado ninguna opción" />
        </div>
      </section>
    </div>
  </section>
</template>
