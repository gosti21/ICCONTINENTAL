<script setup lang="ts">
import loginMachinery from '@/assets/img/login-machinery.png'
import AuthenticationCardLogo from './AuthenticationCardLogo.vue'

withDefaults(defineProps<{ split?: boolean; wide?: boolean }>(), {
  split: false,
  wide: false,
})
</script>

<template>
  <div v-if="split" class="min-h-screen bg-slate-100 lg:grid lg:grid-cols-2">
    <section
      class="relative min-h-56 overflow-hidden bg-slate-900 lg:min-h-screen"
      aria-label="Maquinaria pesada y elementos de fijación"
    >
      <img
        :src="loginMachinery"
        alt="Tractor de maquinaria pesada junto a pernos y tuercas"
        class="auth-hero-image absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-orange-950/10"></div>
      <span class="floating-part floating-part-one" aria-hidden="true"></span>
      <span class="floating-part floating-part-two" aria-hidden="true"></span>
      <span class="floating-part floating-part-three" aria-hidden="true"></span>
      <div class="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10 lg:p-14">
        <span class="mb-4 block h-1 w-14 rounded-full bg-orange-500"></span>
        <p class="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
          Resistencia que mueve industrias
        </p>
        <h1 class="mt-3 max-w-xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
          EL MUNDO DEL PERNO
        </h1>
        <p class="mt-4 hidden max-w-lg text-base text-slate-200 sm:block">
          Pernos, tuercas y soluciones para el sector automotriz y la maquinaria pesada.
        </p>
      </div>
    </section>

    <main class="flex min-h-[calc(100vh-14rem)] items-center justify-center bg-slate-50 px-5 py-10 lg:min-h-screen lg:px-12">
      <div class="w-full" :class="wide ? 'max-w-xl' : 'max-w-md'">
        <div class="mb-7 flex justify-center">
          <AuthenticationCardLogo />
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-xl shadow-slate-900/10 sm:px-8">
          <slot />
        </div>
      </div>
    </main>
  </div>

  <div
    v-else
    class="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900 mx-4 md:mx-0"
  >
    <div>
      <AuthenticationCardLogo />
    </div>
    <div
      class="w-full sm:max-w-md mt-6 px-6 py-6 bg-white dark:bg-gray-800 shadow-md overflow-hidden rounded-lg"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-hero-image {
  animation: industrial-drift 18s ease-in-out infinite alternate;
  transform: scale(1.03);
}

.floating-part {
  position: absolute;
  display: block;
  border: 3px solid rgb(251 146 60 / 35%);
  border-radius: 9999px;
  box-shadow: 0 0 30px rgb(249 115 22 / 20%);
  pointer-events: none;
}

.floating-part::after {
  content: '';
  position: absolute;
  inset: 30%;
  border-radius: inherit;
  background: rgb(15 23 42 / 55%);
}

.floating-part-one {
  top: 12%;
  right: 12%;
  width: 72px;
  height: 72px;
  animation: float-part 8s ease-in-out infinite;
}

.floating-part-two {
  top: 34%;
  left: 8%;
  width: 42px;
  height: 42px;
  animation: float-part 6s ease-in-out -2s infinite reverse;
}

.floating-part-three {
  right: 22%;
  bottom: 24%;
  width: 30px;
  height: 30px;
  animation: float-part 7s ease-in-out -4s infinite;
}

@keyframes industrial-drift {
  from { transform: scale(1.03) translate3d(0, 0, 0); }
  to { transform: scale(1.1) translate3d(-1.5%, -1%, 0); }
}

@keyframes float-part {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.45; }
  50% { transform: translateY(-18px) rotate(35deg); opacity: 0.85; }
}

@media (prefers-reduced-motion: reduce) {
  .auth-hero-image,
  .floating-part {
    animation: none;
  }
}
</style>
