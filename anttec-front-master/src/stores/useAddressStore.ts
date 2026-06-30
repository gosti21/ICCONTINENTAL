import type { addressCheckoutCreateDTO } from '@/DTOs/shop/address/AddressCheckoutCreateDTO'
import type { addressCheckoutUpdateDTO } from '@/DTOs/shop/address/AddressCheckoutUpdateDTO'
import type { generalI } from '@/interfaces/admin/address/generalnterface'
import type { addressExtendSI } from '@/interfaces/shop/AddressExtendSInterface'
import type { addressSI } from '@/interfaces/shop/AddressSInterface'
import AddressSService from '@/services/shop/AddressSService'
import LocationSService from '@/services/shop/LocationSService'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const addressSService = new AddressSService()
const locationSService = new LocationSService()

export const useAddressStore = defineStore('address', () => {
  // State
  const addresses = ref<addressSI[]>([])
  const favoriteAddress = ref<addressSI | null>(null)
  const currentAddress = ref<addressExtendSI | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // State para ubicaciones geográficas
  const departments = ref<generalI[]>([])
  const provinces = ref<generalI[]>([])
  const districts = ref<generalI[]>([])
  const isLoadingLocations = ref(false)

  // Getters
  const hasAddresses = computed(() => addresses.value.length > 0)
  const sortedAddresses = computed(() => {
    return [...addresses.value].sort((a, b) => {
      if (a.favorite) return -1
      if (b.favorite) return 1
      return 0
    })
  })

  // Actions - Direcciones
  const loadAddresses = async () => {
    isLoading.value = true
    error.value = null
    try {
      addresses.value = await addressSService.getAll()
      // Actualizar favoriteAddress si existe
      const favorite = addresses.value.find((addr) => addr.favorite)
      favoriteAddress.value = favorite || null

      // ✅ NUEVO: Retornar la dirección favorita para que el componente la use
      return favorite || null
    } catch (err) {
      error.value = 'Error al cargar las direcciones'
      console.error('Error loading addresses:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadFavoriteAddress = async () => {
    isLoading.value = true
    error.value = null
    try {
      favoriteAddress.value = await addressSService.favorite()
    } catch (err) {
      error.value = 'Error al cargar la dirección favorita'
      console.error('Error loading favorite address:', err)
      favoriteAddress.value = null
    } finally {
      isLoading.value = false
    }
  }

  const loadAddressById = async (id: string | number): Promise<addressExtendSI> => {
    isLoading.value = true
    error.value = null
    try {
      const address = await addressSService.getById(id)
      currentAddress.value = address
      return address
    } catch (err) {
      error.value = 'Error al cargar la dirección'
      console.error('Error loading address by id:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createAddress = async (data: addressCheckoutCreateDTO): Promise<addressSI> => {
    isLoading.value = true
    error.value = null
    try {
      const newAddress = await addressSService.create(data)
      // Recargar todas las direcciones después de crear
      await loadAddresses()
      return newAddress
    } catch (err) {
      error.value = 'Error al crear la dirección'
      console.error('Error creating address:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateAddress = async (id: number, data: addressCheckoutUpdateDTO): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      await addressSService.update(id, data)
      // Recargar todas las direcciones después de actualizar
      await loadAddresses()
    } catch (err) {
      error.value = 'Error al actualizar la dirección'
      console.error('Error updating address:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteAddress = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await addressSService.delete(id)
      // Recargar todas las direcciones después de eliminar
      await loadAddresses()

      // Si era la dirección actual, limpiarla
      if (currentAddress.value?.id === id) {
        currentAddress.value = null
      }
    } catch (err) {
      error.value = 'Error al eliminar la dirección'
      console.error('Error deleting address:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setFavoriteAddress = async (id: number): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      await addressSService.update(id, { favorite: true })
      // Recargar todas las direcciones después de cambiar favorita
      await loadAddresses()
    } catch (err) {
      error.value = 'Error al establecer dirección favorita'
      console.error('Error setting favorite address:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Actions - Ubicaciones geográficas
  const loadDepartments = async () => {
    if (departments.value.length > 0) return

    isLoadingLocations.value = true
    try {
      departments.value = await locationSService.getAllDepartments()
    } catch (err) {
      console.error('Error loading departments:', err)
      throw err
    } finally {
      isLoadingLocations.value = false
    }
  }

  const loadProvinces = async (departmentId: number) => {
    isLoadingLocations.value = true
    try {
      provinces.value = await locationSService.getAllProvinces(departmentId)
      districts.value = []
    } catch (err) {
      console.error('Error loading provinces:', err)
      throw err
    } finally {
      isLoadingLocations.value = false
    }
  }

  const loadDistricts = async (provinceId: number) => {
    isLoadingLocations.value = true
    try {
      districts.value = await locationSService.getAllDistricts(provinceId)
    } catch (err) {
      console.error('Error loading districts:', err)
      throw err
    } finally {
      isLoadingLocations.value = false
    }
  }

  const getDistrictDeliveryPrice = (districtId: number): number => {
    districts.value.find((d) => d.id === districtId)
    return 0
  }

  const clearProvinces = () => {
    provinces.value = []
    districts.value = []
  }

  const clearDistricts = () => {
    districts.value = []
  }

  const clearCurrentAddress = () => {
    currentAddress.value = null
  }

  const reset = () => {
    addresses.value = []
    favoriteAddress.value = null
    currentAddress.value = null
    error.value = null
    departments.value = []
    provinces.value = []
    districts.value = []
  }

  return {
    // State
    addresses,
    favoriteAddress,
    currentAddress,
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
    loadAddressById,
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
    clearCurrentAddress,
    reset,
  }
})
