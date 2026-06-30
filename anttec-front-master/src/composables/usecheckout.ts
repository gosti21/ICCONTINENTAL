import { useCheckoutStore } from '@/stores/useCheckoutstore'
import { storeToRefs } from 'pinia'

export const useCheckout = () => {
  const checkoutStore = useCheckoutStore()

  const {
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
    isBillingInfoValid,
    canProceedToNextStep,
  } = storeToRefs(checkoutStore)

  const {
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
    clearCheckout,
    clearDeliveryAddress,
    initCheckout,
    prepareOrderData,
  } = checkoutStore

  return {
    // State
    checkoutState,
    currentStep,
    isLoading,
    availableBranches,
    isLoadingBranches,

    // Getters
    deliveryInfo,
    billingInfo,
    shippingCost,
    summary,
    stepValidation,
    isDeliveryStepValid,
    isCustomerInfoValid,
    isBillingInfoValid,
    canProceedToNextStep,

    // Actions
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
    clearCheckout,
    clearDeliveryAddress,
    initCheckout,
    prepareOrderData,
  }
}
