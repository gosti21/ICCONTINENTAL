<script setup lang="ts"></script>

<template>
  <div
    class="industrial-loader fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-950"
    role="status"
    aria-live="polite"
    aria-label="Cargando el sistema"
  >
    <div class="flex flex-col items-center">
      <div class="relative flex h-36 w-36 items-center justify-center">
        <div class="loader-glow absolute inset-5 rounded-full"></div>

        <svg class="nut h-28 w-28" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="nut-metal" x1="20" y1="14" x2="99" y2="106">
              <stop offset="0" stop-color="#E2E8F0" />
              <stop offset="0.32" stop-color="#94A3B8" />
              <stop offset="0.62" stop-color="#475569" />
              <stop offset="1" stop-color="#CBD5E1" />
            </linearGradient>
            <linearGradient id="nut-edge" x1="28" y1="25" x2="92" y2="96">
              <stop stop-color="#38BDF8" />
              <stop offset="0.5" stop-color="#2563EB" />
              <stop offset="1" stop-color="#F97316" />
            </linearGradient>
            <filter id="nut-shadow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.28" />
            </filter>
          </defs>
          <path d="M60 10L101 34V86L60 110L19 86V34L60 10Z" fill="url(#nut-metal)" stroke="url(#nut-edge)" stroke-width="4" stroke-linejoin="round" filter="url(#nut-shadow)" />
          <path d="M60 32C75.46 32 88 44.54 88 60C88 75.46 75.46 88 60 88C44.54 88 32 75.46 32 60C32 44.54 44.54 32 60 32Z" fill="#0F172A" stroke="#E2E8F0" stroke-width="4" />
          <path class="thread" d="M42 49C47 43 53 40 60 40C67 40 73 43 78 49M40 60H80M42 71C47 77 53 80 60 80C67 80 73 77 78 71" stroke="url(#nut-edge)" stroke-width="3" stroke-linecap="round" />
          <path d="M35 27L47 20M85 93L73 100" stroke="white" stroke-opacity="0.58" stroke-width="3" stroke-linecap="round" />
        </svg>

        <span class="spark spark-one"></span>
        <span class="spark spark-two"></span>
        <span class="spark spark-three"></span>
      </div>

      <p class="mt-3 text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">
        Preparando el sistema
      </p>
      <div class="mt-3 flex items-center gap-1.5" aria-hidden="true">
        <span class="loading-dot"></span>
        <span class="loading-dot loading-dot-delay-one"></span>
        <span class="loading-dot loading-dot-delay-two"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.industrial-loader {
  background-image: radial-gradient(circle at center, rgb(219 234 254 / 45%) 0, transparent 34%), linear-gradient(rgb(148 163 184 / 7%) 1px, transparent 1px), linear-gradient(90deg, rgb(148 163 184 / 7%) 1px, transparent 1px);
  background-size: auto, 28px 28px, 28px 28px;
}
.loader-glow { background: radial-gradient(circle, rgb(56 189 248 / 32%) 0%, rgb(37 99 235 / 12%) 45%, transparent 72%); animation: glow-pulse 1.8s ease-in-out infinite; }
.nut { transform-origin: center; animation: nut-turn 2.8s cubic-bezier(0.65, 0, 0.35, 1) infinite; }
.thread { stroke-dasharray: 95; animation: thread-flow 1.8s ease-in-out infinite; }
.spark { position: absolute; width: 6px; height: 6px; border-radius: 9999px; background: #38bdf8; box-shadow: 0 0 10px #38bdf8; animation: spark-pulse 1.5s ease-in-out infinite; }
.spark-one { top: 18px; right: 24px; }
.spark-two { right: 12px; bottom: 42px; animation-delay: 0.5s; background: #f97316; box-shadow: 0 0 10px #f97316; }
.spark-three { bottom: 18px; left: 29px; animation-delay: 1s; }
.loading-dot { width: 6px; height: 6px; border-radius: 9999px; background: #2563eb; animation: dot-bounce 1s ease-in-out infinite; }
.loading-dot-delay-one { animation-delay: 0.15s; }
.loading-dot-delay-two { animation-delay: 0.3s; background: #f97316; }
@keyframes nut-turn { 0% { transform: rotate(0deg) scale(0.96); } 45% { transform: rotate(120deg) scale(1); } 65% { transform: rotate(120deg) scale(1); } 100% { transform: rotate(240deg) scale(0.96); } }
@keyframes thread-flow { 0%, 100% { stroke-dashoffset: 95; opacity: 0.45; } 50% { stroke-dashoffset: 0; opacity: 1; } }
@keyframes glow-pulse { 0%, 100% { transform: scale(0.88); opacity: 0.55; } 50% { transform: scale(1.12); opacity: 1; } }
@keyframes spark-pulse { 0%, 100% { transform: scale(0.35); opacity: 0; } 50% { transform: scale(1); opacity: 1; } }
@keyframes dot-bounce { 0%, 100% { transform: translateY(0); opacity: 0.45; } 50% { transform: translateY(-5px); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .nut, .thread, .loader-glow, .spark, .loading-dot { animation-duration: 4s; } }
:global(.dark) .industrial-loader { background-image: radial-gradient(circle at center, rgb(30 64 175 / 22%) 0, transparent 34%), linear-gradient(rgb(148 163 184 / 5%) 1px, transparent 1px), linear-gradient(90deg, rgb(148 163 184 / 5%) 1px, transparent 1px); }
</style>
