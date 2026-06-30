<script setup lang="ts">
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb';
import type { employeeI } from '@/interfaces/admin/employee/employeeInterface';
import EmployeeService from '@/services/admin/EmployeeService';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const employeeService = new EmployeeService()

const employee = ref<employeeI | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Empleados', route: 'admin.users.employees' },
  {
    name: employee.value ? `Detalle - ${employee.value.user.name}` : 'Detalle'
  },
])

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const loadEmployee = async () => {
  try {
    employee.value = await employeeService.getById(id)
  } catch (err) {
    error.value = 'No se pudieron cargar las categorías.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadEmployee()
})
</script>
<template>
  <AnimationLoader v-if="isLoading" />
  <section class="mb-8" v-else>
    <h5 class="text-center text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
      Detalles del Empleado
    </h5>
    <div>
      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Nombres:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ employee?.user.name }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Apellidos:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ employee?.user.last_name }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Correo electrónico:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ employee?.user.email }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Tipo de Documento:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ employee?.document.type }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">N° de Documento:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">
          {{ employee?.document.number }}
        </p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Teléfono:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">
          {{ employee?.phone.number }}
        </p>
      </div>
      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Salario:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">
          S/. {{ employee?.salary }}
        </p>
      </div>
      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Posición:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">
          {{ employee?.posicion }}
        </p>
      </div>
      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Rol:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">
          {{ employee?.rol }}
        </p>
      </div>
    </div>
  </section>
</template>
