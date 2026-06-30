<script setup lang="ts">
import CheckoutSkeleton from './components/CheckoutSkeleton.vue'
import DeliverySummary from '@/components/shop/checkout/address/DeliverySummary.vue'
import PaymentSummary from '@/components/shop/checkout/payment/PaymentSummary.vue'
import { useCheckout } from '@/composables/usecheckout'
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderCheckout from './components/HeaderCheckout.vue'

const router = useRouter()
const route = useRoute()
const { currentStep, goToStep, stepValidation } = useCheckout()

const isInitialLoading = ref(true)

interface Step {
  number: number
  name: string
  route: string
  completed: boolean
  icon: string
}

const steps = computed<Step[]>(() => [
  {
    number: 1,
    name: 'Carrito',
    route: 'shop.cart',
    completed: stepValidation.value.cart,
    icon: 'fa-solid fa-cart-shopping',
  },
  {
    number: 2,
    name: 'Entrega',
    route: 'shop.checkout.delivery',
    completed: stepValidation.value.delivery,
    icon: 'fa-solid fa-truck-fast',
  },
  {
    number: 3,
    name: 'Pago',
    route: 'shop.checkout.payment',
    completed: stepValidation.value.payment,
    icon: 'fa-solid fa-credit-card',
  },
])

onBeforeMount(() => {
  isInitialLoading.value = true
})

// Sincronizar currentStep con la ruta actual
onMounted(() => {
  setTimeout(() => {
    syncStepWithRoute()
    isInitialLoading.value = false
  }, 400)
})

watch(
  () => route.name,
  () => {
    syncStepWithRoute()
  },
)

const syncStepWithRoute = () => {
  const routeName = route.name as string

  if (routeName === 'shop.cart') {
    goToStep(1)
  } else if (routeName === 'shop.checkout.delivery') {
    goToStep(2)
  } else if (routeName === 'shop.checkout.payment') {
    goToStep(3)
  }
}

const handleStepClick = (stepNumber: number) => {
  const step = steps.value[stepNumber - 1]

  // Permitir retroceder solo a pasos anteriores
  if (stepNumber < currentStep.value) {
    goToStep(stepNumber)
    router.push({ name: step.route })
  }
}

const isStepClickable = (stepNumber: number) => {
  return stepNumber < currentStep.value
}

const getCircleClasses = (step: Step) => {
  const isActive = currentStep.value === step.number
  const isCompleted = step.completed && currentStep.value > step.number

  if (isActive) {
    return 'bg-white dark:bg-gray-800 border-2 border-blue-600 dark:border-blue-600'
  } else if (isCompleted) {
    return 'bg-blue-600 dark:bg-blue-600'
  } else {
    return 'bg-gray-300 dark:bg-gray-700'
  }
}

const getIconClasses = (step: Step) => {
  const isActive = currentStep.value === step.number
  const isCompleted = step.completed && currentStep.value > step.number

  if (isActive) {
    return 'text-blue-600 dark:text-blue-400'
  } else if (isCompleted) {
    return 'text-white'
  } else {
    return 'text-gray-400 dark:text-gray-400'
  }
}

const getTextClasses = (step: Step) => {
  const isActive = currentStep.value === step.number
  const isCompleted = step.completed && currentStep.value > step.number

  if (isActive) {
    return 'text-blue-600 dark:text-blue-400 font-bold'
  } else if (isCompleted) {
    return 'text-blue-600 dark:text-blue-500 font-semibold'
  } else {
    return 'text-gray-400 dark:text-gray-500'
  }
}

const getLineClasses = (index: number) => {
  if (currentStep.value > index + 1) {
    return 'after:border-blue-600 dark:after:border-blue-600'
  } else {
    return 'after:border-gray-300 dark:after:border-gray-700'
  }
}
</script>

<template>
  <CheckoutSkeleton v-if="isInitialLoading" />
  <div v-else>
    <HeaderCheckout />
    <div
      class="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900"
    >
      <!-- Stepper -->
      <div
        class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-20 backdrop-blur-sm"
      >
        <div class="container mx-auto px-4 py-6">
          <div class="max-w-3xl mx-auto">
            <ol class="flex items-center w-full">
              <li
                v-for="(step, index) in steps"
                :key="step.number"
                class="flex items-center"
                :class="[
                  index < steps.length - 1 ? 'flex-1' : '',
                  index < steps.length - 1
                    ? `after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block after:mx-2 md:after:mx-4 after:rounded-full ${getLineClasses(index)}`
                    : '',
                ]"
              >
                <div class="flex flex-col items-center gap-2 shrink-0">
                  <!-- Círculo del paso -->
                  <span
                    class="flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 transition-all duration-300"
                    :class="[
                      getCircleClasses(step),
                      isStepClickable(step.number)
                        ? 'cursor-pointer hover:scale-105'
                        : 'cursor-not-allowed',
                    ]"
                    @click="handleStepClick(step.number)"
                  >
                    <font-awesome-icon
                      v-if="step.completed && currentStep > step.number"
                      :icon="step.icon"
                      class="text-base lg:text-lg"
                      :class="getIconClasses(step)"
                    />

                    <!-- Icono del paso -->
                    <font-awesome-icon
                      v-else
                      :icon="step.icon"
                      class="text-base lg:text-lg"
                      :class="getIconClasses(step)"
                    />
                  </span>

                  <!-- Nombre del paso -->
                  <span
                    class="text-xs md:text-sm font-medium text-center whitespace-nowrap"
                    :class="getTextClasses(step)"
                  >
                    {{ step.name }}
                  </span>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="container mx-auto px-4 pt-6 md:pt-8 pb-2">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div class="lg:col-span-2 space-y-6">
            <router-view v-slot="{ Component }">
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 translate-x-8"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 -translate-x-8"
                mode="out-in"
              >
                <component :is="Component" />
              </transition>
            </router-view>
          </div>

          <!-- ✅ Summary dinámico según el paso actual -->
          <div class="lg:col-span-1">
            <div>
              <!-- Paso 2: Entrega - Muestra DeliverySummary -->
              <DeliverySummary v-if="currentStep === 2" />

              <!-- Paso 3: Pago - Muestra PaymentSummary -->
              <PaymentSummary v-else-if="currentStep === 3" />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div
          class="container mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          <div class="flex items-center justify-center gap-4 flex-wrap">
            <span class="flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-lock" class="text-green-600" />
              Pago seguro
            </span>
            <span class="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
            <span class="flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-headset" class="text-indigo-600" />
              Soporte 24/7
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animación suave para el stepper */
@keyframes pulse-ring {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.ring-4 {
  animation: pulse-ring 2s ease-in-out infinite;
}
</style>
