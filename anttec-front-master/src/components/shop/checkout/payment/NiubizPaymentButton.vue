<script setup lang="ts">
import type { NiubizPaymentResponse } from '@/interfaces/shop/NiubizInterface'
import { ref } from 'vue'

interface Props {
  sessionToken: string
  purchaseNumber: string
  amount: number
  merchantId: string
  actionUrl: string
  scriptLoaded: boolean
  disabled?: boolean
}

const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'

const merchantLogo = isLocal
  ? 'img/comercio.png'
  : window.location.origin + '/logo-dark.png'

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'payment-error', error: Error | NiubizPaymentResponse | unknown): void
}>()

const loading = ref(false)

const openPaymentForm = async () => {
  // Esperar a que el script esté cargado
  if ((!props.scriptLoaded && !window.VisanetCheckout) || props.disabled) {
    console.warn('⚠️ Script no cargado o botón deshabilitado')
    return
  }

  try {
    loading.value = true

    sessionStorage.setItem('checkoutRoute', window.location.pathname)

      const actionUrl = new URL(props.actionUrl)
      actionUrl.searchParams.set('return_url', window.location.origin)

    window.VisanetCheckout.configure({
      sessiontoken: props.sessionToken,
      channel: 'web',
      merchantid: props.merchantId,
      purchasenumber: String(props.purchaseNumber),
      amount: props.amount,
      expirationminutes: '20',
      timeouturl: window.location.origin + '/checkout/payment/timeout',
      merchantname: 'FERREBOM',
      merchantlogo: merchantLogo,
      formbuttoncolor: '#753089',
      method: 'POST',
      action: actionUrl.toString(),
    })

    window.VisanetCheckout.open()
  } catch (error) {
    console.error('Error al abrir formulario de pago:', error)
    emit('payment-error', error as Error)
  } finally {
    loading.value = false
  }
}

// Exponer el método para que el padre pueda llamarlo
defineExpose({
  openPaymentForm
})

declare global {
  interface Window {
    VisanetCheckout: {
      configure: (config: {
        sessiontoken: string
        channel: string
        merchantid: string
        purchasenumber: string
        amount: number
        expirationminutes: string
        timeouturl: string
        merchantname: string
        merchantlogo: string
        formbuttoncolor: string
        action: string
        method: string
      }) => void
      open: () => void
    }
  }
}
</script>

<template>
  <button
    @click="openPaymentForm"
    :disabled="disabled || loading"
    class="w-full px-6 py-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 text-lg flex items-center justify-center gap-2 cursor-pointer"
  >
    <font-awesome-icon
      v-if="loading"
      icon="fa-solid fa-spinner"
      spin
    />
    <font-awesome-icon
      v-else
      icon="fa-solid fa-credit-card"
    />
    <span>{{ loading ? 'Espere...' : 'Pagar' }}</span>
  </button>
</template>
