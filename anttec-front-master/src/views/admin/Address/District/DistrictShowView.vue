<script setup lang="ts">
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import type { districtI } from '@/interfaces/admin/address/districtInterface'
import DistrictService from '@/services/admin/DistrictService'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const districtService = new DistrictService()

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const district = ref<districtI | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Distritos', route: 'admin.address.districts' },
  { name: district.value ? `Detalle - ${district.value.name}` : 'Detalle' },
])

const loadDistrict = async () => {
  try {
    district.value = await districtService.getById(id)
  } catch (err) {
    error.value = 'Error al cargar los datos.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadDistrict()
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <div v-else>
    <!-- Información del Producto -->
    <section class="mb-8">
      <h5 class="text-center text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Detalles del Distrito
      </h5>
      <div>
        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Pais:</h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg">{{ district?.country.name }}</p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Departamento:</h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg">{{ district?.department.name }}</p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Provincia:</h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg">{{ district?.province.name }}</p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Distrito:</h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg">{{ district?.name }}</p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Precio de delivery:</h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg whitespace-pre-line">
            S/. {{ district?.shipping_rate.delivery_price }}
          </p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">
            Días minimos del delivery:
          </h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg whitespace-pre-line">
            {{ district?.shipping_rate.min_delivery_days }}
          </p>
        </div>

        <div class="mb-3">
          <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">
            Días máximos del delivery:
          </h6>
          <p class="text-gray-500 dark:text-gray-300 text-lg whitespace-pre-line">
            {{ district?.shipping_rate.max_delivery_days }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
