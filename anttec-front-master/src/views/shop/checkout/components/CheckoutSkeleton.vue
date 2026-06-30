<script setup lang="ts"></script>
<template>
  <div
    class="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900"
  >
    <!-- Header skeleton -->
    <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div class="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- Stepper skeleton -->
    <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div class="container mx-auto px-4 py-6">
        <div class="max-w-3xl mx-auto">
          <div class="flex items-center justify-between">
            <div v-for="i in 2" :key="i" class="flex flex-col items-center gap-2 flex-1">
              <div class="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
              <div class="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal skeleton -->
    <div class="container mx-auto px-4 py-6 md:py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Columna principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Card de título -->
          <div
            class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div class="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div class="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          <!-- Card de selector -->
          <div
            class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div class="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            </div>
          </div>

          <!-- Card de contenido principal -->
          <div
            class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div class="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
            <div class="space-y-4">
              <div
                v-for="i in 2"
                :key="i"
                class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
              ></div>
            </div>
          </div>

          <!-- Card de formulario -->
          <div
            class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div class="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="i in 6" :key="i">
                <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen lateral -->
        <div class="lg:col-span-1">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <!-- Header -->
            <div class="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div class="h-6 w-40 bg-white/20 rounded animate-pulse"></div>
            </div>

            <!-- Contenido -->
            <div class="p-6 space-y-4">
              <!-- Productos skeleton -->
              <div class="space-y-3">
                <div
                  v-for="i in 2"
                  :key="i"
                  class="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div
                    class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                  ></div>
                  <div class="flex-1 space-y-2">
                    <div
                      class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    ></div>
                    <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              <!-- Divider -->
              <div class="border-t border-gray-200 dark:border-gray-700"></div>

              <!-- Precios skeleton -->
              <div class="space-y-3">
                <div v-for="i in 2" :key="i" class="flex justify-between">
                  <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>

              <!-- Total skeleton -->
              <div class="border-t-2 border-gray-300 dark:border-gray-600 pt-4">
                <div class="flex justify-between items-center">
                  <div class="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div class="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>

              <!-- Botón skeleton -->
              <div class="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
