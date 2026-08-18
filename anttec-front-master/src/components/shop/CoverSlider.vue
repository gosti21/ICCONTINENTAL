<script setup lang="ts">
import heroImage from '@/assets/img/home-industrial-hero.png'
import type { coverSI } from '@/interfaces/shop/CoverSInterface'
import { API_BASE_URL } from '@/services/apiConfig'
import CoverSService from '@/services/shop/CoverSService'
import { computed, onMounted, ref } from 'vue'

const coverService = new CoverSService()
const covers = ref<coverSI[]>([])
const failedCoverIds = ref(new Set<number>())

const apiOrigin = new URL(API_BASE_URL).origin
const coverUrl = (url: string) => new URL(url, apiOrigin).toString()
const visibleCovers = computed(() => covers.value.filter((cover) => !failedCoverIds.value.has(cover.id)))

const hideBrokenCover = (id: number) => {
  failedCoverIds.value = new Set([...failedCoverIds.value, id])
}

onMounted(async () => {
  try {
    covers.value = await coverService.getAll()
  } catch {
    // El hero local permanece visible aunque el servicio de portadas no responda.
  }
})
</script>

<template>
  <section class="relative isolate min-h-[520px] overflow-hidden bg-slate-950 lg:min-h-[620px]">
    <img :src="heroImage" alt="Maquinaria pesada con pernos industriales" class="hero-image absolute inset-0 -z-20 h-full w-full object-cover object-[68%_center]" />
    <div class="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/5"></div>
    <div class="industrial-grid absolute inset-0 -z-10 opacity-20"></div>

    <div class="container mx-auto flex min-h-[520px] items-center px-5 py-16 sm:px-8 lg:min-h-[620px] lg:px-12">
      <div class="max-w-2xl text-white">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 backdrop-blur-sm">
          <span class="h-2 w-2 animate-pulse rounded-full bg-orange-400"></span>
          <span class="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">Fijaciones para trabajos exigentes</span>
        </div>
        <h1 class="text-4xl font-black leading-[1.05] sm:text-5xl lg:text-7xl">
          La fuerza comienza con <span class="text-orange-500">el perno correcto.</span>
        </h1>
        <p class="mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
          Pernos, tuercas y soluciones de fijación para automotores, industria y maquinaria pesada. Atención técnica para elegir con seguridad.
        </p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#productos-destacados" class="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-950/30 transition hover:-translate-y-0.5 hover:bg-orange-500">
            Explorar productos <font-awesome-icon icon="fa-solid fa-angles-right" />
          </a>
          <a href="https://wa.me/51964645037" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
            <font-awesome-icon icon="fa-brands fa-whatsapp" /> Hablar con un asesor
          </a>
        </div>
        <div class="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-300">
          <span class="flex items-center gap-2"><font-awesome-icon icon="fa-solid fa-circle-check" class="text-orange-400" /> Asesoría especializada</span>
          <span class="flex items-center gap-2"><font-awesome-icon icon="fa-solid fa-circle-check" class="text-orange-400" /> Calidad industrial</span>
          <span class="flex items-center gap-2"><font-awesome-icon icon="fa-solid fa-circle-check" class="text-orange-400" /> Atención en Huancayo</span>
        </div>
      </div>
    </div>
    <div class="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-orange-600 via-amber-400 to-transparent"></div>
  </section>

  <section v-if="visibleCovers.length" class="bg-slate-950 px-4 py-6 sm:px-6">
    <div class="container mx-auto">
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">Promociones</span>
          <h2 class="mt-1 text-xl font-black text-white">Portadas destacadas</h2>
        </div>
        <span class="text-xs text-slate-400">Desliza para ver más →</span>
      </div>
      <div class="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
        <article v-for="cover in visibleCovers" :key="cover.id" class="min-w-[88%] snap-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl sm:min-w-[70%] lg:min-w-[48%]">
          <img :src="coverUrl(cover.image)" :alt="`Portada promocional ${cover.order}`" class="aspect-3/1 w-full object-cover" loading="lazy" @error="hideBrokenCover(cover.id)" />
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.industrial-grid {
  background-image: linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to right, black, transparent 72%);
}
.hero-image { animation: hero-drift 20s ease-in-out infinite alternate; }
@keyframes hero-drift { from { transform: scale(1.01); } to { transform: scale(1.07) translateX(-.8%); } }
@media (prefers-reduced-motion: reduce) { .hero-image { animation: none; } }
</style>
