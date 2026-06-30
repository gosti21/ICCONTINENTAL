<script setup lang="ts">
import AnimationLoader from '@/components/AnimationLoader.vue'
import BadgeStatus from '@/components/Admin/BadgeStatus.vue'
import ButtonCreate from '@/components/Admin/ButtonCreate.vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import ToggleSwitch from '@/components/Admin/ToggleSwitch.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb';
import { useSweetAlert } from '@/composables/useSweetAlert';
import type { employeesShortI } from '@/interfaces/admin/employee/employeeShortInterface';
import EmployeeService from '@/services/admin/EmployeeService';
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';
import PaginationControls from '@/components/Admin/PaginationControls.vue'

const employeeService = new EmployeeService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Empleados' }])

const employees = ref<employeesShortI | null>(null)
const error = ref<string | null>(null)
const employeesList = computed(() => employees.value?.data ?? [])
const isLoading = ref(true)

// ✅ NUEVO: Estados de paginación
const currentPage = ref(1)
const perPage = ref(15)

// ✅ NUEVO: Función para calcular el índice global
const getGlobalIndex = (localIndex: number) => {
  return (currentPage.value - 1) * perPage.value + localIndex + 1
}

const loadEmployees = async () => {
  try {
    isLoading.value = true
    employees.value = await employeeService.getAll(currentPage.value, perPage.value)
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
  loadEmployees()
}

const handlePerPageChange = (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  loadEmployees()
}

onMounted(() => {
  loadEmployees()
})

const updateStatus = async (id: number, currentStatus: boolean) => {
  try {
    const newStatus = !currentStatus
    useSweetAlert({
      title: 'Enviando...',
      text: 'Actualizando estado',
      icon: 'loading',
    })
    await employeeService.update({ status: newStatus }, String(id))

    const category = employeesList.value.find((c) => c.id === id)
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
    <ButtonCreate route="admin.users.employees.create" />
  </div>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="employeesList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">Nombres</th>
            <th scope="col" class="px-6 py-3">Apellidos</th>
            <th scope="col" class="px-6 py-3">Teléfono</th>
            <th scope="col" class="px-6 py-3">Rol</th>
            <th scope="col" class="px-6 py-3">Estado</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != employeesList.length - 1
                ? 'border-b dark:border-gray-700 border-gray-200'
                : '',
            ]"
            v-for="(employee, index) in employeesList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ getGlobalIndex(index) }}
            </th>
            <td class="px-6 py-4">
              {{ employee.user.name }}
            </td>
            <td class="px-6 py-4">
              {{ employee.user.last_name }}
            </td>
            <td class="px-6 py-4">
              {{ employee.phone.number }}
            </td>
            <td class="px-6 py-4">
              {{ employee.rol }}
            </td>
            <td>
              <BadgeStatus :status="employee.status" />
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-around">
                <router-link
                    :to="{ name: 'admin.users.employees.show', params: { id: employee.id } }"
                  >
                    <font-awesome-icon icon="fa-solid fa-eye" size="xl" class="text-green-400" />
                  </router-link>
                <router-link :to="{ name: 'admin.users.employees.edit', params: { id: employee.id } }">
                  <font-awesome-icon
                    icon="fa-solid fa-pen-to-square"
                    size="xl"
                    class="text-amber-400"
                  />
                </router-link>
                <ToggleSwitch
                 v-if="employee.rol != 'Administrador'"
                  :status="employee.status"
                  @update:status="() => updateStatus(employee.id, employee.status)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- ✅ NUEVO: Componente de paginación -->
      <PaginationControls
        v-if="employees?.meta"
        :meta="employees.meta"
        :per-page="perPage"
        @update:page="handlePageChange"
        @update:per-page="handlePerPageChange"
      />
  </div>
  <InfoAlert v-else message="Todavía no hay categorías registradas" />
</template>
