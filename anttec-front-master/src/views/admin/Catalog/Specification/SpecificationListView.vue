<script setup lang="ts">
import AnimationLoader from '@/components/AnimationLoader.vue'
import BadgeStatus from '@/components/Admin/BadgeStatus.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import ButtonCreate from '@/components/Admin/ButtonCreate.vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { SpecificationsI } from '@/interfaces/admin/SpecificationInterface'
import SpecificationService from '@/services/admin/SpecificationService'
import { computed, onMounted, ref } from 'vue'
import ToggleSwitch from '@/components/Admin/ToggleSwitch.vue'
import Swal from 'sweetalert2'
import PaginationControls from '@/components/Admin/PaginationControls.vue'

const specificationService = new SpecificationService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Especificaciones' }])

const specifications = ref<SpecificationsI | null>(null)
const error = ref<string | null>(null)
const specificationsList = computed(() => specifications.value?.data ?? [])
const isLoading = ref(true)

// ✅ NUEVO: Estados de paginación
const currentPage = ref(1)
const perPage = ref(15)

// ✅ NUEVO: Función para calcular el índice global
const getGlobalIndex = (localIndex: number) => {
  return (currentPage.value - 1) * perPage.value + localIndex + 1
}

const loadSpecifications = async () => {
  try {
    isLoading.value = true
    specifications.value = await specificationService.getAll(currentPage.value, perPage.value)
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
  loadSpecifications()
}

const handlePerPageChange = (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  loadSpecifications()
}

onMounted(() => {
  loadSpecifications()
})

const updateStatus = async (id: number, currentStatus: boolean) => {
  try {
    const newStatus = !currentStatus
    useSweetAlert({
      title: 'Enviando...',
      text: 'Actualizando estado',
      icon: 'loading',
    })
    await specificationService.update({ status: newStatus }, String(id))

    const category = specificationsList.value.find((c) => c.id === id)
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
    <ButtonCreate route="admin.catalog.specifications.create" />
  </div>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="specificationsList.length != 0">
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
              index != specificationsList.length - 1
                ? 'border-b dark:border-gray-700 border-gray-200'
                : '',
            ]"
            v-for="(specification, index) in specificationsList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ getGlobalIndex(index) }}
            </th>
            <td class="px-6 py-4">
              {{ specification.name }}
            </td>
            <td>
              <BadgeStatus :status="specification.status" />
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-around">
                <router-link
                  :to="{
                    name: 'admin.catalog.specifications.edit',
                    params: { id: specification.id },
                  }"
                >
                  <font-awesome-icon
                    icon="fa-solid fa-pen-to-square"
                    size="xl"
                    class="text-amber-400"
                  />
                </router-link>
                <ToggleSwitch
                  :status="specification.status"
                  @update:status="() => updateStatus(specification.id, specification.status)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- ✅ NUEVO: Componente de paginación -->
      <PaginationControls
        v-if="specifications?.meta"
        :meta="specifications.meta"
        :per-page="perPage"
        @update:page="handlePageChange"
        @update:per-page="handlePerPageChange"
      />
  </div>
  <InfoAlert v-else message="Todavía no hay especificaciones registradas" />
</template>
