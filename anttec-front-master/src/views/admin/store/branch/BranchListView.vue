<script setup lang="ts">
import BadgeStatus from '@/components/Admin/BadgeStatus.vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { branchesI } from '@/interfaces/admin/branch/BranchInterface'
import BranchService from '@/services/admin/BranchService'
import { computed, onMounted, ref } from 'vue'

const branchService = new BranchService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Sucursal' }])

const branches = ref<branchesI | null>(null)
const error = ref<string | null>(null)
const branchesList = computed(() => branches.value?.data ?? [])
const isLoading = ref(true)

const loadBranches = async () => {
  try {
    branches.value = await branchService.getAll()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las categorías.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadBranches()
})
</script>
<template>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="branchesList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Email</th>
            <th scope="col" class="px-6 py-3">Dirección</th>
            <th scope="col" class="px-6 py-3">Telefono</th>
            <th scope="col" class="px-6 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != branchesList.length - 1
                ? 'border-b dark:border-gray-700 border-gray-200'
                : '',
            ]"
            v-for="(branch, index) in branchesList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ index + 1 }}
            </th>
            <td class="px-6 py-4">
              {{ branch.name }}
            </td>
            <td class="px-6 py-4">
              {{ branch.email }}
            </td>
            <td class="px-6 py-4">
              {{ branch.address.street }}
            </td>
            <td class="px-6 py-4">
              {{ branch.phone.number }}
            </td>
            <td>
              <BadgeStatus :status="branch.status" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <InfoAlert v-else message="Todavía no hay sucursales registradas" />
</template>
