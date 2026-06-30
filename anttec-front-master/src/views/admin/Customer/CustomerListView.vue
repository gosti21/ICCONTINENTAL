<script setup lang="ts">
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { customersI } from '@/interfaces/admin/CustomerInterface'
import CustomerService from '@/services/admin/CustomerService'
import { computed, onMounted, ref } from 'vue'

const customerService = new CustomerService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Clientes' }])

const customers = ref<customersI | null>(null)
const error = ref<string | null>(null)
const customersList = computed(() => customers.value?.data ?? [])
const isLoading = ref(true)
const typeCustomer = ref<'people' | 'company'>('people')

const loadCustomers = async () => {
  try {
    isLoading.value = true
    customers.value = await customerService.getAll(typeCustomer.value)
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las ventas.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const onTypeChange = () => {
  loadCustomers()
}

onMounted(() => {
  loadCustomers()
})
</script>

<template>
  <div class="flex justify-end items-center mb-4">
    <!-- Select para tipo de cliente -->
    <div class="w-40">
      <label for="type-customer" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Tipo de Cliente
      </label>
      <select
        id="type-customer"
        v-model="typeCustomer"
        @change="onTypeChange"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
      >
        <option value="people">Personas</option>
        <option value="company">Empresas</option>
      </select>
    </div>
  </div>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="customersList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">Tipo de Cliente</th>
            <template v-if="typeCustomer === 'people'">
              <th scope="col" class="px-6 py-3">Nombres</th>
              <th scope="col" class="px-6 py-3">Apellidos</th>
            </template>
            <template v-else>
              <th scope="col" class="px-6 py-3">Razón Social</th>
              <th scope="col" class="px-6 py-3">Dirección Fiscal</th>
            </template>
            <th scope="col" class="px-6 py-3">Tipo de Documento</th>
            <th scope="col" class="px-6 py-3">N° de Documento</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != customersList.length - 1
                ? 'border-b dark:border-gray-700 border-gray-200'
                : '',
            ]"
            v-for="(customer, index) in customersList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ index + 1 }}
            </th>
            <td class="px-6 py-4">
              {{ customer.type_customer }}
            </td>
            <!-- Contenido dinámico según el tipo -->
            <template v-if="typeCustomer === 'people'">
              <td class="px-6 py-4">{{ customer.name }}</td>
              <td class="px-6 py-4">{{ customer.last_name }}</td>
            </template>
            <template v-else>
              <td class="px-6 py-4">{{ customer.business_name }}</td>
              <td class="px-6 py-4">{{ customer.tax_address }}</td>
            </template>
            <td class="px-6 py-4">
              <div class="line-clamp-2 block truncate">
                {{ customer.type_document }}
              </div>
            </td>
            <td class="px-4 py-4">
              <div class="w-32 line-clamp-2 block">
                {{ customer.document_number }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <InfoAlert v-else message="Todavía no hay clientes registradas" />
</template>
