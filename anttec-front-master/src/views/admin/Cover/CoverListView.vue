<script setup lang="ts">
import noImg from '@/assets/img/no-image.jpg'
import BadgeStatus from '@/components/Admin/BadgeStatus.vue'
import ButtonCreate from '@/components/Admin/ButtonCreate.vue'
import InfoAlert from '@/components/Admin/InfoAlert.vue'
import ToggleSwitch from '@/components/Admin/ToggleSwitch.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { coverOrderDTO } from '@/DTOs/admin/cover/CoverOrderDTO'
import type { coverI, coversI } from '@/interfaces/admin/CoverInterface'
import CoverService from '@/services/admin/CoverService'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'
import Draggable from 'vuedraggable'

const coverService = new CoverService()

useBreadcrumb([{ name: 'Dashboard', route: 'admin.dashboard' }, { name: 'Portadas' }])

const covers = ref<coversI | null>(null)
const error = ref<string | null>(null)
const coversList = ref<coverI[]>([]) // para vuedraggable necesitamos un array reactivo
const isLoading = ref(true)
const loadedImages = ref<Record<number, boolean>>({})

// Cargar covers desde el backend
const loadCovers = async () => {
  try {
    covers.value = await coverService.getAll()
    coversList.value = covers.value?.data ?? []
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    error.value = 'No se pudieron cargar las portadas.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadCovers()
})

// Toggle de estado de portada
const updateStatus = async (id: number | string, currentStatus: boolean) => {
  try {
    const newStatus = !currentStatus
    useSweetAlert({
      title: 'Enviando...',
      text: 'Actualizando estado',
      icon: 'loading',
    })
    await coverService.updateStatus({ status: newStatus }, String(id))

    const cover = coversList.value.find((c) => c.id === id)
    if (cover) {
      cover.status = newStatus
    }

    Swal.close()
  } catch (error) {
    useSweetAlert({ title: 'Algo salió mal', text: 'Intenta de nuevo', icon: 'error', timer: 0 })
    console.log(error)
  }
}

// Cuando se termina de arrastrar, enviar nuevo orden
const onDragEnd = async () => {
  try {
    const data = { sorts: coversList.value.map((c) => c.id) }
    await coverService.order(data as coverOrderDTO)

    useSweetAlert({
      title: 'Éxito',
      text: 'El orden de las portadas se ha actualizado',
      icon: 'success',
      timer: 1500,
    })
  } catch (err) {
    console.error(err)
    useSweetAlert({
      title: 'Error',
      text: 'No se pudo actualizar el orden',
      icon: 'error',
      timer: 0,
    })
  }
}
</script>

<template>
  <div class="flex justify-end mb-4">
    <ButtonCreate route="admin.covers.create" />
  </div>

  <AnimationLoader v-if="isLoading" />

  <div v-else-if="coversList.length">
    <Draggable v-model="coversList" item-key="id" class="space-y-5" @end="onDragEnd">
      <template #item="{ element: cover, index }">
        <li
          class="lg:flex overflow-hidden rounded-lg shadow-xl bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 cursor-move"
          :key="cover.id"
        >
          <!-- Imagen -->
          <div class="relative w-full lg:w-64 aspect-3/1 shrink-0">
            <!-- Skeleton -->
            <div
              v-if="!loadedImages[index]"
              class="absolute inset-0 flex items-center justify-center bg-neutral-quaternary animate-pulse"
            >
              <img
                :src="noImg"
                alt="Cargando imagen"
                class="w-full h-full object-cover object-center"
              />
              <span class="sr-only">Loading...</span>
            </div>

            <img
              :src="cover.image ?? noImg"
              alt="Imagen de la portada"
              class="w-full h-full object-cover object-center"
              @load="loadedImages[index] = true"
              @error="loadedImages[index] = true"
            />
          </div>

          <!-- Info -->
          <div
            class="p-4 lg:flex-1 lg:flex lg:justify-between lg:items-center space-y-3 lg:space-y-0"
          >
            <div class="font-semibold">
              <h1>{{ cover.title }}</h1>
              <BadgeStatus :status="cover.status" />
            </div>
            <div class="lg:flex lg:flex-col lg:items-center">
              <p class="text-sm font-bold">Fecha de inicio</p>
              <p>{{ cover.start_at }}</p>
            </div>
            <div class="lg:flex lg:flex-col lg:items-center">
              <p class="text-sm font-bold">Fecha de fin</p>
              <p>{{ cover.end_at ?? '-' }}</p>
            </div>
            <div class="flex lg:space-x-4 space-x-3">
              <router-link :to="{ name: 'admin.covers.edit', params: { id: cover.id } }">
                <font-awesome-icon
                  icon="fa-solid fa-pen-to-square"
                  size="xl"
                  class="text-amber-400"
                />
              </router-link>
              <ToggleSwitch
                :status="cover.status"
                @update:status="() => updateStatus(cover.id, cover.status)"
              />
            </div>
          </div>
        </li>
      </template>
    </Draggable>
  </div>

  <InfoAlert v-else message="Todavía no hay portadas registradas" />
</template>
