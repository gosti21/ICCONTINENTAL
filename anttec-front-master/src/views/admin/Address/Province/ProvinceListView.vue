<script setup lang="ts">
import BadgeStatus from '@/components/Admin/BadgeStatus.vue'
import ButtonCreate from '@/components/Admin/ButtonCreate.vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import ToggleSwitch from '@/components/Admin/ToggleSwitch.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { provincesI } from '@/interfaces/admin/address/provinceInterface'
import ProvinceService from '@/services/admin/ProvinceService'
import Swal from 'sweetalert2'
import { computed, onMounted, ref } from 'vue'

const provinceService = new ProvinceService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Provincias' }])

const provinces = ref<provincesI | null>(null)
const error = ref<string | null>(null)
const provincesList = computed(() => provinces.value?.data ?? [])
const isLoading = ref(true)

const loadDepartments = async () => {
  try {
    provinces.value = await provinceService.getAll()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar los departamentos.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadDepartments()
})

const updateStatus = async (id: number, currentStatus: boolean) => {
  try {
    const newStatus = !currentStatus
    useSweetAlert({
      title: 'Enviando...',
      text: 'Actualizando estado',
      icon: 'loading',
    })
    await provinceService.update({ status: newStatus }, String(id))

    const category = provincesList.value.find((c) => c.id === id)
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
    <ButtonCreate route="admin.address.provinces.create" />
  </div>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="provincesList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Pais</th>
            <th scope="col" class="px-6 py-3">Departamento</th>
            <th scope="col" class="px-6 py-3">Estado</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != provincesList.length - 1
                ? 'border-b dark:border-gray-700 border-gray-200'
                : '',
            ]"
            v-for="(province, index) in provincesList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ index + 1 }}
            </th>
            <td class="px-6 py-4">
              {{ province.name }}
            </td>
            <td class="px-6 py-4">
              {{ province.country.name }}
            </td>
            <td class="px-6 py-4">
              {{ province.department.name }}
            </td>
            <td>
              <BadgeStatus :status="province.status" />
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-around">
                <router-link
                  :to="{ name: 'admin.address.provinces.edit', params: { id: province.id } }"
                >
                  <font-awesome-icon
                    icon="fa-solid fa-pen-to-square"
                    size="xl"
                    class="text-amber-400"
                  />
                </router-link>
                <ToggleSwitch
                  :status="province.status"
                  @update:status="() => updateStatus(province.id, province.status)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <InfoAlert v-else message="Todavía no hay provincias registradas" />
</template>
