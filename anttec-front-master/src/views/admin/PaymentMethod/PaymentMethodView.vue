<script setup lang="ts">
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb';
import { useSweetAlert } from '@/composables/useSweetAlert';
import type { paymentMethodI } from '@/interfaces/admin/PaymentMethodInterface';
import PaymentMethodService from '@/services/admin/PaymentMethodService';
import { computed, onMounted, ref } from 'vue';
import PaymentEditmodal from './components/PaymentEditmodal.vue';

const paymentMethodService = new PaymentMethodService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Pago QR' }])

const paymentMethods = ref<paymentMethodI[] | null>(null)
const error = ref<string | null>(null)
const paymentMethodList = computed(() => paymentMethods.value ?? [])
const isLoading = ref(true)

const editModalRef = ref<InstanceType<typeof PaymentEditmodal> | null>(null)

const loadPaymentMethod = async () => {
  try {
    paymentMethods.value = await paymentMethodService.getAllList()
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar los metodos de pago.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPaymentMethod()
})

const openEditModal = (id: number) => {
  editModalRef.value?.open(id)
}

// ── Cuando el modal emite 'updated', actualizamos el item en la lista local ─
const onUpdated = (updated: paymentMethodI) => {
  if (!paymentMethods.value) return

  const index = paymentMethods.value.findIndex((item) => item.id === updated.id)
  if (index !== -1) {
    paymentMethods.value[index] = updated
  }
}
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <div v-else-if="paymentMethodList.length != 0">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">#</th>
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Tipo</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900',
              index != paymentMethodList.length - 1
                ? 'border-b dark:border-gray-700 border-gray-200'
                : '',
            ]"
            v-for="(category, index) in paymentMethodList"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ index + 1 }}
            </th>
            <td class="px-6 py-4">
              {{ category.name }}
            </td>
            <td class="px-6 py-4">
              {{ category.type }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-around">
                <!-- Botón edit → abre modal en lugar de navegar -->
                <button
                  @click="openEditModal(category.id)"
                  type="button"
                  class="cursor-pointer"
                  title="Editar método de pago"
                >
                  <font-awesome-icon
                    icon="fa-solid fa-pen-to-square"
                    size="xl"
                    class="text-amber-400 hover:text-amber-500 transition-colors"
                  />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <InfoAlert v-else message="Todavía no hay metodos de pago registradas" />

  <PaymentEditmodal
    ref="editModalRef"
    @updated="onUpdated"
  />
</template>
