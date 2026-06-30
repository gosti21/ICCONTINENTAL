<script setup lang="ts">
import noImg from '@/assets/img/no-image.jpg'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { coverSI } from '@/interfaces/shop/CoverSInterface'
import CoverSService from '@/services/shop/CoverSService'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { computed, onMounted, ref } from 'vue'

const coverSService = new CoverSService()

const covers = ref<coverSI[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const coversList = computed(() => covers.value ?? [])

const loadCovers = async () => {
  try {
    const data = await coverSService.getAll()
    // Agregar imgLoaded en false a cada cover
    covers.value = data.map((cover) => ({ ...cover, imgLoaded: false }))
  } catch (err) {
    useSweetAlert({
      title: 'Algo salió mal',
      text: 'No se pudieron cargar las portadas',
      icon: 'error',
      timer: 0,
    })
    error.value = 'No se pudieron cargar las portadas.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const handleImageLoad = (index: number) => {
  if (covers.value[index]) {
    covers.value[index].imgLoaded = true
  }
}

onMounted(() => {
  loadCovers()
})
</script>

<template>
  <section class="w-full">
    <!-- Skeleton Loader -->
    <div
      v-if="isLoading"
      class="w-full aspect-3/1 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center"
    >
      <img :src="noImg" alt="Cargando" class="w-16 h-16 opacity-30" />
    </div>

    <!-- Swiper Slider -->
    <Swiper
      v-else-if="coversList.length > 0"
      :modules="[Autoplay, Pagination, Navigation]"
      :slides-per-view="1"
      :space-between="0"
      :loop="true"
      :autoplay="{
        delay: 3000,
        disableOnInteraction: false,
      }"
      :pagination="{
        clickable: true,
      }"
      :navigation="true"
      class="w-full aspect-3/1"
    >
      <SwiperSlide v-for="(cover, index) in coversList" :key="cover.id">
        <div class="relative w-full h-full">
          <!-- Skeleton individual para cada imagen -->
          <div
            v-if="!cover.imgLoaded"
            class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse"
          >
            <img :src="noImg" alt="Cargando" class="w-16 h-16 opacity-30" />
          </div>

          <!-- Imagen de la portada -->
          <img
            :src="cover.image"
            :alt="`Portada ${index + 1}`"
            loading="lazy"
            class="w-full h-full object-cover object-center transition-opacity duration-300"
            :class="{ 'opacity-0': !cover.imgLoaded }"
            @load="handleImageLoad(index)"
            @error="handleImageLoad(index)"
          />
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- Mensaje cuando no hay portadas -->
    <div
      v-else
      class="w-full aspect-3/1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
    >
      <p class="text-gray-500 dark:text-gray-400 text-lg">No hay portadas disponibles</p>
    </div>
  </section>
</template>

<style scoped>
/* Estilos personalizados para los botones de navegación */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #753089;
  font-weight: 600;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  transform: scale(1.1);
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 24px;
  font-weight: bold;
}

/* Estilos para la paginación */
:deep(.swiper-pagination-bullet) {
  background-color: rgba(117, 48, 137, 0.5);
  opacity: 0.7;
  width: 10px;
  height: 10px;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background-color: #753089;
  width: 12px;
  height: 12px;
}

/* Responsivo: Ocultar botones en móviles */
@media (max-width: 640px) {
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    display: none;
  }
}
</style>
