import BranchSService from '@/services/shop/BranchSService'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useCartStore } from './useCartStore'
import type {
  CheckoutStateSI,
  CheckoutSummarySI,
  CustomerDataSI,
  StepValidationSI,
} from '@/interfaces/shop/Checkoutsinterface'
import type { branchSI } from '@/interfaces/shop/BranchSInterface'
import type { ShippingMethodType } from '@/interfaces/shop/Shippingsinterface '
import type { addressSI } from '@/interfaces/shop/AddressSInterface'

const branchSService = new BranchSService()

export const useCheckoutStore = defineStore('checkout', () => {
  const cartStore = useCartStore()

  // ✅ CORREGIDO: Cargar estado inicial desde localStorage
  const loadInitialState = (): CheckoutStateSI => {
    try {
      const savedState = localStorage.getItem('checkout_state')
      if (savedState) {
        const parsed = JSON.parse(savedState)
        return parsed
      }
    } catch (error) {
      console.error('Error al cargar estado inicial:', error)
    }
    return {}
  }

  const loadInitialStep = (): number => {
    try {
      const savedStep = localStorage.getItem('checkout_step')
      if (savedStep) {
        return parseInt(savedStep, 10)
      }
    } catch (error) {
      console.error('Error al cargar paso inicial:', error)
    }
    return 2 // Paso por defecto
  }

  // State - ✅ Inicializar con datos del localStorage
  const checkoutState = ref<CheckoutStateSI>(loadInitialState())
  const currentStep = ref<number>(loadInitialStep())
  const isLoading = ref(false)

  // State para sucursales disponibles
  const availableBranches = ref<branchSI[]>([])
  const isLoadingBranches = ref(false)

  // Getters
  const deliveryInfo = computed(() => checkoutState.value.delivery)
  const billingInfo = computed(() => checkoutState.value.billing)
  const shippingCost = computed(() => deliveryInfo.value?.shipping_cost || 0)

  const summary = computed((): CheckoutSummarySI => {
    const cartTotal = Number(cartStore.totals.total)
    const shipping = Number(shippingCost.value)
    const discount = 0

    return {
      subtotal: Number(cartTotal),
      shipping_cost: Number(shipping),
      discount: Number(discount),
      total: Number(cartTotal + shipping - discount),
      items_count: cartStore.totals.items_count,
    }
  })

  const isCustomerInfoValid = computed(() => {
    const customer = deliveryInfo.value?.reciber
    if (!customer) return false

    if (
      !customer.name?.trim() ||
      !customer.last_name?.trim() ||
      !customer.document_number?.trim() ||
      !customer.phone?.trim() ||
      !customer.document_type
    ) {
      return false
    }

    const validDocumentTypes = ['DNI', 'CE'] as const
    if (!validDocumentTypes.includes(customer.document_type)) {
      return false
    }

    if (customer.name.length < 3 || customer.name.length > 100) {
      return false
    }

    if (customer.last_name.length < 3 || customer.last_name.length > 100) {
      return false
    }

    const phoneRegex = /^[0-9]+$/
    if (!phoneRegex.test(customer.phone) || customer.phone.length !== 9) {
      return false
    }

    const documentRegex = /^[0-9]+$/
    if (!documentRegex.test(customer.document_number)) {
      return false
    }

    if (customer.document_type === 'DNI' && customer.document_number.length !== 8) {
      return false
    }

    if (customer.document_type === 'CE' && customer.document_number.length !== 12) {
      return false
    }

    return true
  })

  const stepValidation = computed((): StepValidationSI => {
    return {
      cart: !cartStore.isEmpty,
      delivery: isDeliveryStepValid.value,
      payment: isBillingInfoValid.value,
    }
  })

  const isDeliveryStepValid = computed(() => {
    const delivery = deliveryInfo.value
    if (!delivery) return false

    if (!delivery.delivery_type) return false

    if (!isCustomerInfoValid.value) return false

    if (delivery.delivery_type === 'shipment') {
      return delivery.address_id !== undefined && delivery.shipping_cost !== undefined
    } else if (delivery.delivery_type === 'store_pickup') {
      return delivery.branch_id !== undefined
    }

    return false
  })

  const canProceedToNextStep = computed(() => {
    switch (currentStep.value) {
      case 1:
        return stepValidation.value.cart
      case 2:
        return stepValidation.value.delivery
      case 3:
        return stepValidation.value.payment
      default:
        return false
    }
  })

  // Actions - Navegación de pasos
  const goToStep = (step: number) => {
    if (step >= 1 && step <= 3) {
      currentStep.value = step
      saveToLocalStorage()
    }
  }

  const nextStep = () => {
    if (canProceedToNextStep.value && currentStep.value < 3) {
      currentStep.value++
      saveToLocalStorage()
    }
  }

  const prevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
      saveToLocalStorage()
    }
  }

  // Actions - Información de entrega
  const setShippingMethod = (method: ShippingMethodType) => {
    if (!checkoutState.value.delivery) {
      checkoutState.value.delivery = {
        delivery_type: method,
        reciber: {
          name: '',
          last_name: '',
          document_type: 'DNI',
          document_number: '',
          phone: '',
        },
      }
    } else {
      checkoutState.value.delivery.delivery_type = method

      if (method === 'shipment') {
        delete checkoutState.value.delivery.branch_id
      } else {
        delete checkoutState.value.delivery.address_id
        checkoutState.value.delivery.shipping_cost = 0
      }
    }
    saveToLocalStorage()
  }

  const setDeliveryAddress = (address: addressSI) => {
    if (!checkoutState.value.delivery) {
      console.error('Debe establecer el método de envío primero')
      return
    }

    checkoutState.value.delivery.address_id = address.id
    checkoutState.value.delivery.shipping_cost = address.delivery_price
    saveToLocalStorage()
  }

  const setPickupBranch = (branch: branchSI) => {
    if (!checkoutState.value.delivery) {
      console.error('Debe establecer el método de envío primero')
      return
    }

    checkoutState.value.delivery.branch_id = branch.address.id
    checkoutState.value.delivery.shipping_cost = branch.delivery_price
    saveToLocalStorage()
  }

  const setCustomerData = (customer: CustomerDataSI) => {
    if (!checkoutState.value.delivery) {
      checkoutState.value.delivery = {
        delivery_type: 'shipment',
        reciber: customer,
      }
    } else {
      checkoutState.value.delivery.reciber = customer
    }
    saveToLocalStorage()
  }

  const updateCustomerData = (updates: Partial<CustomerDataSI>) => {
    if (!checkoutState.value.delivery) {
      console.error('Debe inicializar la información de entrega primero')
      return
    }

    checkoutState.value.delivery.reciber = {
      ...checkoutState.value.delivery.reciber,
      ...updates,
    }
    saveToLocalStorage()
  }

  const loadAvailableBranches = async () => {
    isLoadingBranches.value = true
    try {
      const branches = await branchSService.getAll()
      availableBranches.value = Array.isArray(branches) ? branches : [branches]
    } catch (error) {
      console.error('Error cargando sucursales:', error)
      availableBranches.value = []
      throw error
    } finally {
      isLoadingBranches.value = false
    }
  }

  // ✅ CORREGIDO: Guardar con logs para debug
  const saveToLocalStorage = () => {
    try {
      const stateToSave = JSON.stringify(checkoutState.value)
      const stepToSave = String(currentStep.value)

      localStorage.setItem('checkout_state', stateToSave)
      localStorage.setItem('checkout_step', stepToSave)
    } catch (error) {
      console.error('❌ Error guardando estado del checkout:', error)
    }
  }

  // ✅ CORREGIDO: Cargar con logs para debug
  const loadFromLocalStorage = () => {
    try {
      const savedState = localStorage.getItem('checkout_state')
      const savedStep = localStorage.getItem('checkout_step')

      if (savedState) {
        const parsed = JSON.parse(savedState)
        checkoutState.value = parsed
      } else {
        console.log('⚠️ No hay estado guardado en localStorage')
      }

      if (savedStep) {
        currentStep.value = parseInt(savedStep, 10)
        console.log('✅ Paso cargado:', currentStep.value)
      }
    } catch (error) {
      console.error('❌ Error cargando estado del checkout:', error)
    }
  }

  const clearDeliveryAddress = () => {
    if (!checkoutState.value.delivery) return

    delete checkoutState.value.delivery.address_id
    checkoutState.value.delivery.shipping_cost = undefined
    saveToLocalStorage()
  }

  const clearCheckout = () => {
    checkoutState.value = {}
    currentStep.value = 2
    availableBranches.value = []

    localStorage.removeItem('checkout_state')
    localStorage.removeItem('checkout_step')
  }

  // ✅ CORREGIDO: No sobrescribe si ya existe data
  const initCheckout = async () => {
    // Solo inicializar si NO hay delivery info
    if (!checkoutState.value.delivery) {
      checkoutState.value.delivery = {
        delivery_type: 'shipment',
        reciber: {
          name: '',
          last_name: '',
          document_type: 'DNI',
          document_number: '',
          phone: '',
        },
      }
      saveToLocalStorage()
    }
  }

  const prepareOrderData = () => {
    return {
      session_id: cartStore.sessionId,
      delivery: checkoutState.value.delivery,
      billing: checkoutState.value.billing,
      payment: checkoutState.value.payment,
      summary: summary.value,
    }
  }

  const isBillingInfoValid = computed(() => {
    const billing = checkoutState.value.billing
    if (!billing) return false

    // Validar que exista el tipo de documento
    if (!billing.document_type) return false

    // ========================================
    // Validación para BOLETA (boletaSchema)
    // ========================================
    if (billing.type_voucher === 'boleta') {
      // 1. Verificar que existan todos los campos requeridos
      if (
        !billing.document_type ||
        !billing.document_number?.trim() ||
        !billing.customer.name?.trim() ||
        !billing.customer.last_name?.trim()
      ) {
        return false
      }

      // 2. Validar tipo de documento (solo DNI o CE)
      const validDocumentTypes = ['DNI', 'CE', 'RUC'] as const
      if (!validDocumentTypes.includes(billing.document_type)) {
        return false
      }

      // 3. Validar nombre (min 3, max 100)
      if (billing.customer.name.length < 3 || billing.customer.name.length > 100) {
        return false
      }

      // 4. Validar apellido (min 3, max 100)
      if (billing.customer.last_name.length < 3 || billing.customer.last_name.length > 100) {
        return false
      }

      // 5. Validar formato de número de documento (solo números)
      const documentRegex = /^[0-9]+$/
      if (!documentRegex.test(billing.document_number)) {
        return false
      }

      // 6. Validar longitud según tipo de documento
      if (billing.document_type === 'DNI') {
        // DNI debe tener exactamente 8 dígitos
        if (billing.document_number.length !== 8) {
          return false
        }
      } else if (billing.document_type === 'CE') {
        // CE debe tener exactamente 12 dígitos
        if (billing.document_number.length !== 12) {
          return false
        }
      }

      return true
    }

    // ========================================
    // Validación para FACTURA (facturaSchema)
    // ========================================
    if (billing.type_voucher === 'factura') {
      // 1. Verificar que existan todos los campos requeridos
      if (
        !billing.document_number?.trim() ||
        !billing.customer.business_name?.trim() ||
        !billing.customer.tax_address?.trim()
      ) {
        return false
      }

      // 2. Validar razón social (min 3, max 100)
      if (billing.customer.business_name.length < 3 || billing.customer.business_name.length > 100) {
        return false
      }

      // 3. Validar dirección fiscal (min 1, max 150)
      if (billing.customer.tax_address.length < 1 || billing.customer.tax_address.length > 150) {
        return false
      }

      // 4. Validar formato de RUC (solo números)
      const rucRegex = /^(10|20)[0-9]{9}$/
      if (!rucRegex.test(billing.document_number)) {
        return false
      }

      return true
    }

    return false
  })

  return {
    checkoutState,
    currentStep,
    isLoading,
    availableBranches,
    isLoadingBranches,

    deliveryInfo,
    billingInfo,
    shippingCost,
    summary,
    stepValidation,
    isDeliveryStepValid,
    isCustomerInfoValid,
    canProceedToNextStep,
    isBillingInfoValid,

    goToStep,
    nextStep,
    prevStep,

    setShippingMethod,
    setDeliveryAddress,
    setPickupBranch,
    setCustomerData,
    updateCustomerData,
    loadAvailableBranches,

    saveToLocalStorage,
    loadFromLocalStorage,
    clearDeliveryAddress,
    clearCheckout,
    initCheckout,
    prepareOrderData,
  }
})
