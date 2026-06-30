<script setup lang="ts">
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'
import { FreeMode, Navigation, Pagination, Thumbs } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { ref } from 'vue'
import noImg from '@/assets/img/no-image.jpg'
import type { imgSI } from '@/interfaces/shop/Variant/selectedVariantInterface'

interface Props {
  images: imgSI[]
  productName: string
  swiperKey: number
}

defineProps<Props>()

const emit = defineEmits<{
  imageLoad: [index: number]
}>()

const thumbsSwiper = ref<SwiperType | null>(null)

const setThumbsSwiper = (swiper: SwiperType) => {
  thumbsSwiper.value = swiper
}

const handleImageLoad = (index: number) => {
  emit('imageLoad', index)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Swiper Principal -->
    <Swiper
      :key="`main-swiper-${swiperKey}`"
      :modules="[Navigation, Pagination, Thumbs]"
      :navigation="images.length > 1"
      :pagination="images.length > 1 ? { clickable: true } : false"
      :thumbs="{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }"
      class="w-full aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg"
    >
      <SwiperSlide v-for="(image, index) in images" :key="index">
        <div class="relative w-full h-full">
          <!-- Skeleton por imagen -->
          <div
            v-if="!image.imgLoaded"
            class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse"
          >
            <img :src="noImg" alt="Cargando" class="w-20 h-20 opacity-30" />
          </div>

          <!-- Imagen del producto -->
          <img
            :src="image.url"
            :alt="`${productName} - Imagen ${index + 1}`"
            loading="lazy"
            class="w-full h-full object-contain p-8 transition-opacity duration-300"
            :class="{ 'opacity-0': !image.imgLoaded }"
            @load="handleImageLoad(index)"
            @error="handleImageLoad(index)"
          />
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- Thumbnails -->
    <Swiper
      v-if="images.length > 1"
      :key="`thumbs-swiper-${swiperKey}`"
      :modules="[FreeMode, Thumbs]"
      :space-between="10"
      :slides-per-view="4"
      :free-mode="true"
      :watch-slides-progress="true"
      @swiper="setThumbsSwiper"
      class="thumbs-swiper w-full"
    >
      <SwiperSlide v-for="(image, index) in images" :key="index" class="cursor-pointer">
        <div
          class="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <img
            :src="image.url"
            :alt="`Thumbnail ${index + 1}`"
            class="w-full h-full object-cover"
          />
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
/* Estilos para Swiper */
.thumbs-swiper .swiper-slide-thumb-active > div {
  border-color: rgb(37 99 235);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.dark .thumbs-swiper .swiper-slide-thumb-active > div {
  border-color: rgb(96 165 250);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

/* Personalizar navegación del swiper */
.swiper-button-next,
.swiper-button-prev {
  color: rgb(37 99 235);
  background: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --swiper-navigation-size: 20px;
}

.dark .swiper-button-next,
.dark .swiper-button-prev {
  color: rgb(96 165 250);
  background: rgb(31 41 55);
}

.swiper-button-next:hover,
.swiper-button-prev:hover {
  background: rgb(37 99 235);
  color: white;
}

.dark .swiper-button-next:hover,
.dark .swiper-button-prev:hover {
  background: rgb(96 165 250);
  color: rgb(17 24 39);
}

.swiper-button-next:after,
.swiper-button-prev:after {
  font-size: 20px;
  font-weight: bold;
}

.swiper-pagination-bullet {
  background-color: rgb(209 213 219);
  width: 10px;
  height: 10px;
  opacity: 1;
}

.dark .swiper-pagination-bullet {
  background-color: rgb(75 85 99);
}

.swiper-pagination-bullet-active {
  background-color: rgb(37 99 235);
  width: 24px;
  border-radius: 5px;
}

.dark .swiper-pagination-bullet-active {
  background-color: rgb(96 165 250);
}
</style>
