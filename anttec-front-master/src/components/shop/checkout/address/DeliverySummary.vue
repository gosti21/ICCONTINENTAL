<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckout } from '@/composables/usecheckout'
import CheckoutSummaryBase from '../CheckoutSummaryBase.vue'

const router = useRouter()
const { deliveryInfo, canProceedToNextStep, nextStep, isCustomerInfoValid } = useCheckout()

// Verificar si hay dirección/sucursal seleccionada
const hasShippingDestinationSelected = computed(() => {
  if (!deliveryInfo.value) return false

  if (deliveryInfo.value.delivery_type === 'shipment') {
    return deliveryInfo.value.address_id !== undefined
  } else if (deliveryInfo.value.delivery_type === 'store_pickup') {
    return deliveryInfo.value.branch_id !== undefined
  }

  return false
})

// Mensaje dinámico del botón
const buttonMessage = computed(() => {
  if (!deliveryInfo.value?.delivery_type) {
    return 'Selecciona un método de envío'
  }

  if (!hasShippingDestinationSelected.value) {
    if (deliveryInfo.value.delivery_type === 'shipment') {
      return 'Selecciona una dirección de entrega'
    } else {
      return 'Selecciona una sucursal'
    }
  }

  if (!isCustomerInfoValid.value) {
    return 'Completa tus datos personales'
  }

  return 'Continuar al pago'
})

const handleContinue = () => {
  if (canProceedToNextStep.value) {
    nextStep()
    router.push({ name: 'shop.checkout.payment' })
  }
}
</script>

<template>
  <CheckoutSummaryBase
    :button-text="buttonMessage"
    :button-disabled="!canProceedToNextStep"
    button-variant="blue"
    @button-click="handleContinue"
  />
</template>
