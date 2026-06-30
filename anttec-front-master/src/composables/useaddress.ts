import { useAddressStore } from '@/stores/useAddressStore'
import { storeToRefs } from 'pinia'

export const useAddress = () => {
  const addressStore = useAddressStore()

  const {
    addresses,
    favoriteAddress,
    currentAddress, // 👈 NUEVO
    isLoading,
    error,
    departments,
    provinces,
    districts,
    isLoadingLocations,
    hasAddresses,
    sortedAddresses,
  } = storeToRefs(addressStore)

  const {
    loadAddresses,
    loadFavoriteAddress,
    loadAddressById, // 👈 NUEVO
    createAddress,
    updateAddress,
    deleteAddress,
    setFavoriteAddress,
    loadDepartments,
    loadProvinces,
    loadDistricts,
    getDistrictDeliveryPrice,
    clearProvinces,
    clearDistricts,
    clearCurrentAddress, // 👈 NUEVO
    reset,
  } = addressStore

  return {
    // State
    addresses,
    favoriteAddress,
    currentAddress, // 👈 NUEVO
    isLoading,
    error,
    departments,
    provinces,
    districts,
    isLoadingLocations,

    // Getters
    hasAddresses,
    sortedAddresses,

    // Actions
    loadAddresses,
    loadFavoriteAddress,
    loadAddressById, // 👈 NUEVO
    createAddress,
    updateAddress,
    deleteAddress,
    setFavoriteAddress,
    loadDepartments,
    loadProvinces,
    loadDistricts,
    getDistrictDeliveryPrice,
    clearProvinces,
    clearDistricts,
    clearCurrentAddress, // 👈 NUEVO
    reset,
  }
}
