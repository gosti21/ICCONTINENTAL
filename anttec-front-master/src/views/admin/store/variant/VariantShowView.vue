<script setup lang="ts">
import noImg from '@/assets/img/no-image.jpg'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import type { variantI } from '@/interfaces/admin/variant/variantInterface'
import VariantService from '@/services/admin/VariantService'
import type { Swiper as SwiperClass } from 'swiper'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import { FreeMode, Navigation, Thumbs } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const variantService = new VariantService()

useBreadcrumb([
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Inventario', route: 'admin.store.variants' },
  { name: 'Detalle' },
])

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const variant = ref<variantI | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const thumbsSwiper = ref<SwiperClass | null>(null)
const setThumbsSwiper = (swiper: SwiperClass) => {
  thumbsSwiper.value = swiper
}
const variantImages = computed(() => variant.value?.img ?? [])
const loadedImages = ref<boolean[]>([])
watch(
  () => variantImages.value,
  (imgs) => {
    loadedImages.value = imgs.map(() => false)
  },
  { immediate: true },
)

const loadVariant = async () => {
  try {
    variant.value = await variantService.getById(id)
  } catch (err) {
    error.value = 'No se pudieron cargar las categorías.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadVariant()
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <section class="mb-8" v-else>
    <h5 class="text-center text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
      Detalles de la Variante
    </h5>
    <div>
      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Producto:</h6>
        <router-link
          :to="{ name: 'admin.catalog.products.show', params: { id: variant?.product.id } }"
        >
          <p class="text-gray-500 dark:text-gray-300 text-lg hover:underline">
            {{ variant?.product.name }} – {{ variant?.product.model }}
            <font-awesome-icon icon="fa-solid fa-link" size="lg" />
          </p>
        </router-link>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">SKU:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ variant?.sku }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Precio de compra:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ variant?.purcharse_price }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Precio de venta:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ variant?.selling_price }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Stock:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">{{ variant?.branch_stock.stock }}</p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium">Stock Mínimo:</h6>
        <p class="text-gray-500 dark:text-gray-300 text-lg">
          {{ variant?.branch_stock.stock_min }}
        </p>
      </div>

      <div class="mb-3">
        <h6 class="text-lg text-gray-700 dark:text-gray-200 font-medium mb-3 text-center">
          Combinaciones:
        </h6>
        <div class="w-full flex justify-center">
          <div class="max-w-md w-full">
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table class="w-full text-left rtl:text-right text-gray-500 dark:text-gray-300">
                <thead
                  class="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300"
                >
                  <tr>
                    <th scope="col" class="px-6 py-3">Opción</th>
                    <th scope="col" class="px-6 py-3">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    :class="[
                      'bg-white dark:bg-gray-800',
                      index != (variant?.features.length ?? 0) - 1
                        ? 'border-b dark:border-gray-700 border-gray-200'
                        : '',
                    ]"
                    v-for="(feature, index) in variant?.features"
                    :key="index"
                  >
                    <td class="px-6 py-4">
                      {{ feature.option }}
                    </td>
                    <td class="px-6 py-4">
                      <div v-if="feature.type === 'text'">
                        <span
                          class="bg-gray-100 text-gray-800 text-sm font-medium me-2 pl-2.5 pr-2 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300"
                        >
                          {{ feature.description }}
                        </span>
                      </div>
                      <div v-else class="flex items-center justify-center gap-3">
                        <span
                          class="inline-block h-6 w-6 shadow-lg rounded-full border-2 border-gray-300 dark:border-gray-500"
                          :style="{ backgroundColor: feature.value }"
                        ></span>

                        <span
                          class="text-sm bg-gray-100 text-gray-800 font-medium px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300 text-center"
                        >
                          {{ feature.description }}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h6 class="text-lg font-medium mb-3 text-center text-gray-700 dark:text-gray-200">
          Imágenes
        </h6>

        <div v-if="variantImages.length" class="flex flex-col items-center gap-3">
          <!-- SWIPER PRINCIPAL -->
          <Swiper
            :modules="[FreeMode, Navigation, Thumbs]"
            :space-between="10"
            :navigation="true"
            :thumbs="{ swiper: thumbsSwiper }"
            class="w-full max-w-md aspect-square sm:aspect-4/3 lg:aspect-3/4"
          >
            <SwiperSlide v-for="(img, i) in variantImages" :key="img.id ?? i">
              <div class="relative w-full h-full">
                <!-- Skeleton -->
                <div
                  v-if="!loadedImages[i]"
                  class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse rounded"
                >
                  <img :src="noImg" alt="Cargando" class="w-10 h-10 opacity-50" />
                </div>

                <!-- Imagen principal -->
                <img
                  :src="img.url"
                  loading="lazy"
                  class="w-5/6 h-5/6 object-contain rounded mx-auto"
                  @load="loadedImages[i] = true"
                  @error="loadedImages[i] = true"
                />
              </div>
            </SwiperSlide>
          </Swiper>

          <!-- MINIATURAS -->
          <Swiper
            @swiper="setThumbsSwiper"
            :modules="[FreeMode, Thumbs]"
            :free-mode="true"
            :watch-slides-progress="true"
            :slide-to-clicked-slide="true"
            :space-between="10"
            :breakpoints="{
              0: { slidesPerView: 3 },
              640: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
            }"
            class="w-full max-w-md h-20"
          >
            <SwiperSlide v-for="img in variantImages" :key="img.id" class="group rounded-md">
              <img
                :src="img.url"
                loading="lazy"
                class="w-full h-full object-contain rounded-md cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 ease-out group-[.swiper-slide-thumb-active]:border-blue-500 dark:group-[.swiper-slide-thumb-active]:border-blue-400 group-[.swiper-slide-thumb-active]:shadow-md group-[.swiper-slide-thumb-active]:bg-blue-50 dark:group-[.swiper-slide-thumb-active]:bg-gray-700"
              />
            </SwiperSlide>
          </Swiper>
        </div>

        <p v-else class="text-center text-gray-500 dark:text-gray-400">
          No hay imágenes para esta variante.
        </p>
      </div>
    </div>
  </section>
</template>
