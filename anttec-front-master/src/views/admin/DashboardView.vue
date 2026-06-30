<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { DashboardStatsI } from '@/interfaces/admin/DashboardInterface'
import DashboardService from '@/services/admin/DashboardService'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

useBreadcrumb([{ name: 'Dashboard' }])

const dashboardService = new DashboardService()

// Estados
const loading = ref(true)
const stats = ref<DashboardStatsI>({
  total_sales: 0,
  total_orders: 0,
  total_products: 0,
  total_customers: 0
})

const salesChartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Ventas Mensuales (S/.)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      data: [] as number[]
    }
  ]
})

const topVariantsData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Unidades Vendidas',
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      data: [] as number[]
    }
  ]
})

const topCategoriesData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Unidades Vendidas',
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      data: [] as number[]
    }
  ]
})

const topBrandsData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Unidades Vendidas',
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      data: [] as number[]
    }
  ]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: '#9CA3AF'
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#9CA3AF'
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      }
    },
    x: {
      ticks: {
        color: '#9CA3AF'
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      }
    }
  }
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        color: '#9CA3AF'
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      }
    },
    y: {
      ticks: {
        color: '#9CA3AF'
      },
      grid: {
        display: false
      }
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#9CA3AF',
        padding: 15
      }
    }
  }
}

// Función para obtener datos del dashboard
const fetchDashboardData = async () => {
  try {
    loading.value = true

    // Llamadas paralelas a todas las APIs
    const [statsData, salesData, variantsData, categoriesData, brandsData] = await Promise.all([
      dashboardService.getStats(),
      dashboardService.getSalesChart(),
      dashboardService.getTopVariants(),
      dashboardService.getTopCategories(),
      dashboardService.getTopBrands()
    ])

    // Asignar estadísticas
    stats.value = statsData

    // Asignar datos del gráfico de ventas - CORREGIDO
    salesChartData.value = {
      labels: salesData.labels,
      datasets: [
        {
          label: 'Ventas Mensuales (S/.)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          data: salesData.data
        }
      ]
    }

    // Asignar top variantes - CORREGIDO
    topVariantsData.value = {
      labels: variantsData.map((v) => v.name),
      datasets: [
        {
          label: 'Unidades Vendidas',
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          data: variantsData.map((v) => v.sales)
        }
      ]
    }

    // Asignar top categorías - CORREGIDO
    topCategoriesData.value = {
      labels: categoriesData.map((c) => c.name),
      datasets: [
        {
          label: 'Unidades Vendidas',
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          data: categoriesData.map((c) => c.sales)
        }
      ]
    }

    // Asignar top marcas - CORREGIDO
    topBrandsData.value = {
      labels: brandsData.map((b) => b.name),
      datasets: [
        {
          label: 'Unidades Vendidas',
          backgroundColor: [
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          data: brandsData.map((b) => b.sales)
        }
      ]
    }
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas Totales</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              S/. {{ stats.total_sales.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
            </p>
          </div>
          <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <svg
              class="w-8 h-8 text-blue-600 dark:text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Órdenes</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {{ stats.total_orders }}
            </p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <svg
              class="w-8 h-8 text-green-600 dark:text-green-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Variantes</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {{ stats.total_products }}
            </p>
          </div>
          <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <svg
              class="w-8 h-8 text-yellow-600 dark:text-yellow-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Clientes</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {{ stats.total_customers }}
            </p>
          </div>
          <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
            <svg
              class="w-8 h-8 text-purple-600 dark:text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Charts Section -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sales Chart -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ventas Mensuales (Últimos 6 Meses)
        </h3>
        <div class="h-80">
          <Line :data="salesChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Top Variants Chart -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top 5 Variantes Más Vendidas
        </h3>
        <div class="h-80">
          <Doughnut :data="topVariantsData" :options="doughnutOptions" />
        </div>
      </div>
    </section>

    <!-- Categories and Brands Charts -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Categories Chart -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top 5 Categorías Más Vendidas
        </h3>
        <div class="h-80">
          <Bar :data="topCategoriesData" :options="barChartOptions" />
        </div>
      </div>

      <!-- Top Brands Chart -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top 5 Marcas Más Demandadas
        </h3>
        <div class="h-80">
          <Bar :data="topBrandsData" :options="barChartOptions" />
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"
        ></div>
        <p class="text-gray-900 dark:text-white font-medium">Cargando dashboard...</p>
      </div>
    </div>
  </div>
</template>
