<script setup lang="ts">
import { computed, ref, nextTick, watch, onMounted } from 'vue'
import { useCheckout } from '@/composables/usecheckout'
import CheckoutSummaryBase from '../CheckoutSummaryBase.vue'
import NiubizPaymentButton from './NiubizPaymentButton.vue'
import PaymentSService from '@/services/shop/PaymentSService'
import type { NiubizConfig } from '@/interfaces/shop/NiubizInterface'
import OverlayLoader from '../common/OverlayLoader.vue'

const { checkoutState, isBillingInfoValid, canProceedToNextStep, deliveryInfo, billingInfo } = useCheckout()

const paymentSService = new PaymentSService()
const niubizButtonRef = ref<InstanceType<typeof NiubizPaymentButton> | null>(null)

// Estados
const isLoadingToken = ref(false)
const sessionToken = ref<string | null>(null)
const order_id = ref<string>('')
const total = ref<number>(0.00)
const showPaymentButton = ref(false)
const niubizScriptLoaded = ref(false)
const niubizInitialized = ref(false)

const buildNiubizScriptCandidates = (): string[] => {
  const configuredUrl = (import.meta.env.VITE_NIUBIZ_URL_JS || '').trim()
  const envName = (import.meta.env.VITE_NIUBIZ_ENV || '').toLowerCase()

  const sandboxDefaults = [
    'https://apisandbox.vnforappstest.com/v1/checkoutjs',
    'https://apisandbox.vnforappstest.com/v1/checkout.js',
    'https://static-content-qas.vnforapps.com/v2/js/checkout.js'
  ]

  const productionDefaults = [
    'https://apiprod.vnforapps.com/v1/checkoutjs',
    'https://apiprod.vnforapps.com/v1/checkout.js',
    'https://static-content.vnforapps.com/v2/js/checkout.js'
  ]

  const defaults = envName === 'production' ? productionDefaults : sandboxDefaults

  return [configuredUrl, ...defaults].filter((url, index, self) => {
    return Boolean(url) && self.indexOf(url) === index
  })
}

  // ⬇️ PRECARGAR SCRIPT DE NIUBIZ INMEDIATAMENTE
const loadNiubizScript = (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (window.VisanetCheckout) {
      niubizScriptLoaded.value = true
      resolve()
      return
    }

    const candidates = buildNiubizScriptCandidates()
    const errors: string[] = []

    for (const url of candidates) {
      try {
        await new Promise<void>((resolveLoad, rejectLoad) => {
          const existingScript = document.querySelector(`script[src="${url}"]`) as HTMLScriptElement | null
          if (existingScript && window.VisanetCheckout) {
            niubizScriptLoaded.value = true
            resolveLoad()
            return
          }

          const script = existingScript ?? document.createElement('script')
          script.src = url
          script.async = true

          script.onload = () => {
            if (window.VisanetCheckout) {
              niubizScriptLoaded.value = true
              resolveLoad()
              return
            }
            rejectLoad(new Error(`El script cargó pero VisanetCheckout no está disponible (${url})`))
          }

          script.onerror = () => {
            rejectLoad(new Error(`No se pudo cargar ${url}`))
          }

          if (!existingScript) {
            document.head.appendChild(script)
          }
        })

        resolve()
        return
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors.push(message)
      }
    }

    reject(new Error(`Error al cargar el script de Niubiz. Intentos: ${errors.join(' | ')}`))
  })
}

const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'

const merchantLogo = isLocal
  ? 'img/comercio.png'
  : window.location.origin + '/logo-dark.png'

// ⬇️ NUEVO: Pre-inicializar Niubiz con configuración dummy
const preInitializeNiubiz = () => {
  if (!window.VisanetCheckout || niubizInitialized.value) return

  try {
    // Configurar con datos dummy para que Niubiz cargue todos sus servicios
    const dummyConfig: NiubizConfig = {
      sessiontoken: 'dummy-token',
      channel: 'web',
      merchantid: import.meta.env.VITE_NIUBIZ_MERCHANT_ID,
      purchasenumber: 'INIT-0000',
      amount: 1,
      expirationminutes: '20',
      timeouturl: window.location.origin + '/checkout/payment/timeout',
      merchantname: 'ANTTECH',
      merchantlogo: merchantLogo,
      formbuttoncolor: '#753089',
      method: 'POST',
      action: window.location.origin + '/checkout/payment/callback',
      complete: () => {}
    }

    window.VisanetCheckout.configure(dummyConfig)

    niubizInitialized.value = true
  } catch (error) {
    console.warn('⚠️ Error en pre-inicialización:', error)
  }
}

onMounted(async () => {
  try {
    await loadNiubizScript()
    // Esperar un momento y luego pre-inicializar
    setTimeout(() => {
      preInitializeNiubiz()
    }, 500)
  } catch (error) {
    console.error('❌ Error al precargar Niubiz:', error)
  }
})


const canGetToken = computed(() => {
  return canProceedToNextStep.value && !isLoadingToken.value && !showPaymentButton.value
})

const buttonMessage = computed(() => {
  if (isLoadingToken.value) {
    return 'Espere...'
  }
  if (showPaymentButton.value) {
    return 'Listo'
  }
  if (!checkoutState.value.billing?.type_voucher) {
    return 'Selecciona un tipo de comprobante'
  }
  if (!isBillingInfoValid.value) {
    if (checkoutState.value.billing.type_voucher === 'boleta') {
      return 'Completa los datos de la boleta'
    } else {
      return 'Completa los datos de la factura'
    }
  }
  return 'Pagar'
})

// Observar cambios en la validez de los datos de facturación
watch(
  () => isBillingInfoValid.value,
  (isValid) => {
    // Si los datos dejan de ser válidos, resetear el estado del pago
    if (!isValid && showPaymentButton.value) {
      console.log('⚠️ Datos de facturación inválidos - reseteando estado de pago')
      showPaymentButton.value = false
      sessionToken.value = null
    }
  }
)

const handleGetToken = async () => {
  if (!canGetToken.value) return

  try {
    isLoadingToken.value = true
    const address_id = deliveryInfo.value?.address_id ?? deliveryInfo.value?.branch_id ?? 1
    // Obtener solo el session token
    const res = await paymentSService.createOrderSessionToken({
      type_voucher: billingInfo.value?.type_voucher ?? 'boleta',
      delivery_type: deliveryInfo.value?.delivery_type,
      document_type: billingInfo.value?.document_type,
      document_number: billingInfo.value?.document_number,
      customer: billingInfo.value?.customer,
      receiver_info: deliveryInfo.value?.reciber,
      address_id: address_id
    })

    sessionToken.value = res.session_token
    order_id.value = String(res.order_id)
    total.value = Number(Number(res.total).toFixed(2))

    if (!niubizScriptLoaded.value || !window.VisanetCheckout) {
      await loadNiubizScript()
    }

    // Mostrar el botón de pago
    showPaymentButton.value = true

    // Esperar a que el componente se monte y luego abrir automáticamente
    await nextTick()
    niubizButtonRef.value?.openPaymentForm()

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    isLoadingToken.value = false
  }
}
</script>

<template>
  <OverlayLoader
    :show="isLoadingToken"
    message="Preparando pago"
    variant="primary"
  />

  <CheckoutSummaryBase
    :button-text="buttonMessage"
    :button-disabled="!canGetToken"
    :button-variant="showPaymentButton ? 'blue' : 'green'"
    :show-button="!showPaymentButton"
    @button-click="handleGetToken"
  >
    <template #after-button>
      <!-- Botón de Niubiz visible cuando hay token -->
      <NiubizPaymentButton
        v-if="showPaymentButton && sessionToken"
        ref="niubizButtonRef"
        :session-token="sessionToken"
        :purchase-number="order_id"
        :amount="total"
        :script-loaded="niubizScriptLoaded"
      />
    </template>
  </CheckoutSummaryBase>
</template>
