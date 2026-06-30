<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import ButtonCreate from '@/components/Admin/ButtonCreate.vue'
import ToggleSwitch from '@/components/Admin/ToggleSwitch.vue'
import { useSweetAlert } from '@/composables/useSweetAlert'
import Swal from 'sweetalert2'
import BadgeStatus from '@/components/Admin/BadgeStatus.vue'
import CourierService from '@/services/admin/CourierService'
import type { couriersI } from '@/interfaces/admin/CourierInterface'

const courierService = new CourierService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Couriers' }])

const couriers = ref<couriersI | null>(null)
const error = ref<string | null>(null)
const couriersiesList = computed(() => couriers.value?.data ?? [])
const isLoading = ref(true)

const loadCategories = async () => {
  try {
    couriers.value = await courierService.getAll()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las categorías.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
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
    await courierService.update({ status: newStatus }, String(id))

    const category = couriersiesList.value.find((c) => c.id === id)
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
    <ButtonCreate route="admin.couriers.create" />
  </div>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="couriersiesList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Teléfono</th>
            <th scope="col" class="px-6 py-3">Email</th>
            <th scope="col" class="px-6 py-3">Calle</th>
            <th scope="col" class="px-6 py-3">Estado</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != couriersiesList.length - 1
                ? 'border-b dark:border-gray-700 border-gray-200'
                : '',
            ]"
            v-for="(courier, index) in couriersiesList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ index + 1 }}
            </th>
            <td class="px-6 py-4">
              {{ courier.name }}
            </td>
            <td class="px-6 py-4">
              {{ courier.phone ?? '-'}}
            </td>
            <td class="px-6 py-4">
              {{ courier.email ?? '-'}}
            </td>
            <td class="px-6 py-4">
              {{ courier.district }} - {{ courier.street }}
            </td>
            <td>
              <BadgeStatus :status="courier.status" />
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-around">
                <router-link :to="{ name: 'admin.couriers.edit', params: { id: courier.id } }">
                  <font-awesome-icon
                    icon="fa-solid fa-pen-to-square"
                    size="xl"
                    class="text-amber-400"
                  />
                </router-link>
                <ToggleSwitch
                  :status="courier.status"
                  @update:status="() => updateStatus(courier.id, courier.status)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <InfoAlert v-else message="Todavía no hay couriers registrados" />
</template>
