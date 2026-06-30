import type { cartSI, cartTotalSI } from '@/interfaces/shop/Cart/CartSInterface'
import type { detailCartSI } from '@/interfaces/shop/Cart/DetailCartSInterface'
import CartSService from '@/services/shop/CartSService'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const cartSService = new CartSService()

export const useCartStore = defineStore('cart', () => {
  const cart = ref<cartSI | null>(null)
  const items = ref<detailCartSI[]>([])
  const totals = ref<cartTotalSI>({
    total: 0,
    items_count: 0,
  })

  const isLoading = ref(false)
  const sessionId = ref<string>('')
  const isDrawerOpen = ref(false)

  // Getters
  const itemsCount = computed(() => totals.value.items_count)
  const isEmpty = computed(() => items.value.length === 0)
  const hasItems = computed(() => items.value.length > 0)

  // Inicializar sessionId (UUID v4 simple)
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const initSessionId = () => {
    const stored = localStorage.getItem('cart_session_id')
    if (stored) {
      sessionId.value = stored
    } else {
      sessionId.value = generateUUID()
      localStorage.setItem('cart_session_id', sessionId.value)
    }
  }

  // Cargar carrito desde el backend
  const loadCart = async () => {
    isLoading.value = true
    try {
      initSessionId()
      const data = await cartSService.getCart(sessionId.value)
      cart.value = data.cart
      items.value = data.cart.detail_cart || []
      totals.value = data.totals
    } catch (error) {
      console.error('Error cargando carrito:', error)
      // Si falla, inicializar vacío
      items.value = []
      totals.value = {
        total: 0,
        items_count: 0,
      }
    } finally {
      isLoading.value = false
    }
  }

  // Agregar item al carrito
  const addItem = async (branchVariantId: number, quantity: number = 1) => {
    isLoading.value = true
    try {
      const data = await cartSService.addItem(sessionId.value, {
        branch_variant_id: branchVariantId,
        quantity: quantity,
      })

      // Actualizar el item en el array
      const existingIndex = items.value.findIndex(
        (item) => item.branch_variant_id === branchVariantId,
      )
      if (existingIndex !== -1) {
        items.value[existingIndex] = data.item
      } else {
        items.value.push(data.item)
      }

      totals.value = data.totals

      // Abrir drawer automáticamente
      isDrawerOpen.value = true

      return data.item
    } catch (error) {
      console.error('Error agregando item:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Actualizar cantidad de un item
  const updateItemQuantity = async (branchVariantId: number, quantity: number) => {
    isLoading.value = true
    try {
      if (quantity === 0) {
        await removeItem(branchVariantId)
        return
      }

      const data = await cartSService.updateItemQuantity(sessionId.value, branchVariantId, {
        quantity: quantity,
      })

      if (data.item) {
        const existingIndex = items.value.findIndex(
          (item) => item.branch_variant_id === branchVariantId,
        )
        if (existingIndex !== -1) {
          items.value[existingIndex] = data.item
        }
      }

      totals.value = data.totals
    } catch (error) {
      console.error('Error actualizando cantidad:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Eliminar item del carrito
  const removeItem = async (branchVariantId: number) => {
    isLoading.value = true
    try {
      const data = await cartSService.removeItem(sessionId.value, branchVariantId)
      items.value = items.value.filter((item) => item.branch_variant_id !== branchVariantId)
      totals.value = data.totals
    } catch (error) {
      console.error('Error eliminando item:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Vaciar todo el carrito
  const clearCart = async () => {
    isLoading.value = true
    try {
      await cartSService.clearCart(sessionId.value)
      items.value = []
      totals.value = {
        total: 0,
        items_count: 0,
      }
    } catch (error) {
      console.error('Error vaciando carrito:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Limpiar carrito en logout (sin llamar al backend)
  const clearOnLogout = async () => {
    // Limpiar estado local
    items.value = []
    totals.value = {
      total: 0,
      items_count: 0,
    }
    cart.value = null

    localStorage.removeItem('cart_session_id')
    initSessionId()

    // Cerrar drawer si está abierto
    isDrawerOpen.value = false
  }

  // Sincronizar carrito cuando el usuario se autentique
  const mergeCart = async () => {
    if (!sessionId.value) {
      console.warn('No hay sessionId para sincronizar')
      return
    }
    if (isEmpty.value) {
      console.log('El carrito está vacío, no hay nada que sincronizar')
      return
    }
    isLoading.value = true
    try {
      const data = await cartSService.mergeCart(sessionId.value)
      cart.value = data.cart
      items.value = data.cart.detail_cart || []
      totals.value = data.totals

      // Generar nuevo sessionId para futuras compras
      sessionId.value = generateUUID()
      localStorage.setItem('cart_session_id', sessionId.value)
      console.log('Carrito sincronizado exitosamente con el usuario')
    } catch (error) {
      console.error('Error sincronizando carrito:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Verificar si un producto está en el carrito
  const isInCart = (branchVariantId: number): boolean => {
    return items.value.some((item) => item.branch_variant_id === branchVariantId)
  }

  // Obtener cantidad de un producto en el carrito
  const getItemQuantity = (branchVariantId: number): number => {
    const item = items.value.find((item) => item.branch_variant_id === branchVariantId)
    return item?.quantity || 0
  }

  // Toggle drawer
  const toggleDrawer = () => {
    isDrawerOpen.value = !isDrawerOpen.value
  }

  const openDrawer = () => {
    isDrawerOpen.value = true
  }

  const closeDrawer = () => {
    isDrawerOpen.value = false
  }

  return {
    // State
    cart,
    items,
    totals,
    isLoading,
    sessionId,
    isDrawerOpen,

    // Getters
    itemsCount,
    isEmpty,
    hasItems,

    // Actions
    loadCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    clearOnLogout,
    mergeCart,
    isInCart,
    getItemQuantity,
    toggleDrawer,
    openDrawer,
    closeDrawer,
  }
})
