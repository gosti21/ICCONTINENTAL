<script setup lang="ts">
import BadgeStatus from '@/components/Admin/BadgeStatus.vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { countriesI } from '@/interfaces/admin/address/countryInterface'
import CountryService from '@/services/admin/CountryService'
import { computed, onMounted, ref } from 'vue'

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Paises' }])

const countryService = new CountryService()

const countries = ref<countriesI | null>(null)
const error = ref<string | null>(null)
const countriesList = computed(() => countries.value?.data ?? [])
const isLoading = ref(true)

const loadCountries = async () => {
  try {
    countries.value = await countryService.getAll()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar los países.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
onMounted(() => {
  loadCountries()
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="countriesList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Codigo ISO</th>
            <th scope="col" class="px-6 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != countriesList.length - 1
                ? 'border-b dark:border-gray-700 border-gray-200'
                : '',
            ]"
            v-for="(country, index) in countriesList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ index + 1 }}
            </th>
            <td class="px-6 py-4">
              {{ country.name }}
            </td>
            <td class="px-6 py-4">
              {{ country.iso_code }}
            </td>
            <td>
              <BadgeStatus :status="country.status" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <InfoAlert v-else message="Todavía no hay países registrados" />
</template>
