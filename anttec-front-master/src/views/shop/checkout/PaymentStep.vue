<script setup lang="ts">
import InfoInvoice from '@/components/shop/checkout/payment/InfoInvoice.vue'
import { useCheckout } from '@/composables/usecheckout'

const { deliveryInfo } = useCheckout()
</script>

<template>
  <div class="space-y-6">
    <!-- Componente de facturación -->
    <InfoInvoice />

    <!-- Resumen de entrega -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700"
    >
      <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-truck-fast" class="text-blue-500" />
        Información de entrega confirmada
      </h2>

      <div class="rounded-lg py-2 px-6 space-y-2">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-gray-600 dark:text-gray-400">Método:</span>
          <span class="font-medium text-gray-900 dark:text-gray-100">
            {{
              deliveryInfo?.delivery_type === 'shipment'
                ? 'Envío a domicilio'
                : 'Recojo en tienda'
            }}
          </span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="text-gray-600 dark:text-gray-400">Receptor:</span>
          <span class="font-medium text-gray-900 dark:text-gray-100">
            {{ deliveryInfo?.reciber.name }} {{ deliveryInfo?.reciber?.last_name }}
          </span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="text-gray-600 dark:text-gray-400">Teléfono:</span>
          <span class="font-medium text-gray-900 dark:text-gray-100">
            {{ deliveryInfo?.reciber?.phone }}
          </span>
        </div>
      </div>
    </div>

    <!-- Información importante -->
    <div
      class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6"
    >
      <div class="flex gap-3">
        <font-awesome-icon
          icon="fa-solid fa-circle-info"
          class="text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0"
        />
        <div class="text-sm text-yellow-800 dark:text-yellow-200">
          <p class="font-medium mb-1">Importante</p>
          <ul class="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
            <li>Verifica que tus datos sean correctos antes de proceder al pago</li>
            <li>El comprobante será enviado a tu correo electrónico</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
