<script setup lang="ts">
import CategoryService from '@/services/admin/CategoryService'
import { computed, onMounted, ref } from 'vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import ButtonCreate from '@/components/Admin/ButtonCreate.vue'
import ToggleSwitch from '@/components/Admin/ToggleSwitch.vue'
import { useSweetAlert } from '@/composables/useSweetAlert'
import Swal from 'sweetalert2'
import BadgeStatus from '@/components/Admin/BadgeStatus.vue'
import type { categoriesI } from '@/interfaces/admin/CategoryInterface'
import PaginationControls from '@/components/Admin/PaginationControls.vue'

const categoryService = new CategoryService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Categorías' }])

const categories = ref<categoriesI | null>(null)
const error = ref<string | null>(null)
const categoriesList = computed(() => categories.value?.data ?? [])
const isLoading = ref(true)

// ✅ NUEVO: Estados de paginación
const currentPage = ref(1)
const perPage = ref(15)

// ✅ NUEVO: Función para calcular el índice global
const getGlobalIndex = (localIndex: number) => {
  return (currentPage.value - 1) * perPage.value + localIndex + 1
}

const loadCategories = async () => {
  try {
    isLoading.value = true
    categories.value = await categoryService.getAll(currentPage.value, perPage.value)
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las categorías.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// ✅ NUEVO: Handlers de paginación
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadCategories()
}

const handlePerPageChange = (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  loadCategories()
}

onMounted(() => {
  loadCategories()
})

const updateStatus = async (id: number, currentStatus: boolean) => {
  try {
    const newStatus = !currentStatus
    useSweetAlert({
      title: 'Enviando...',
      text: 'Actualizando estado',
      icon: 'loading',
    })
    await categoryService.update({ status: newStatus }, String(id))

    const category = categoriesList.value.find((c) => c.id === id)
    if (category) {
      category.status = newStatus
    }

    Swal.close()
  } catch (error) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    console.log(error)
  }
}
</script>

<template>
  <div class="flex justify-end">
    <ButtonCreate route="admin.categories.create" />
  </div>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="categoriesList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Estado</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != categoriesList.length - 1
                ? 'border-b dark:border-gray-700 border-gray-200'
                : '',
            ]"
            v-for="(category, index) in categoriesList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ getGlobalIndex(index) }}
            </th>
            <td class="px-6 py-4">
              {{ category.name }}
            </td>
            <td>
              <BadgeStatus :status="category.status" />
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-around">
                <router-link :to="{ name: 'admin.categories.edit', params: { id: category.id } }">
                  <font-awesome-icon
                    icon="fa-solid fa-pen-to-square"
                    size="xl"
                    class="text-amber-400"
                  />
                </router-link>
                <ToggleSwitch
                  :status="category.status"
                  @update:status="() => updateStatus(category.id, category.status)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- ✅ NUEVO: Componente de paginación -->
      <PaginationControls
        v-if="categories?.meta"
        :meta="categories.meta"
        :per-page="perPage"
        @update:page="handlePageChange"
        @update:per-page="handlePerPageChange"
      />
  </div>
  <InfoAlert v-else message="Todavía no hay categorías registradas" />
</template>
