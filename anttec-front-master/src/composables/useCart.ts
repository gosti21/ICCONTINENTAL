// src/composables/useCart.ts - CORREGIDO

import { useCartStore } from '@/stores/useCartStore'
import { useSweetAlert } from './useSweetAlert'
import axios from 'axios'
import { useSweetAlertToast } from './useSweetAlertToast'
import { storeToRefs } from 'pinia' // ← IMPORTAR ESTO

export function useCart() {
  const cartStore = useCartStore()

  // ✅ USAR storeToRefs para mantener reactividad
  const { items, totals, itemsCount, isEmpty, hasItems, isLoading, isDrawerOpen } =
    storeToRefs(cartStore)

  /**
   * Agregar al carrito con feedback
   */
  const addToCart = async (branchVariantId: number, quantity: number = 1) => {
    try {
      await cartStore.addItem(branchVariantId, quantity)

      useSweetAlertToast({
        title: '¡Agregado!',
        text: `${quantity} ${quantity === 1 ? 'producto agregado' : 'productos agregados'} al carrito`,
        icon: 'success',
        timer: 2000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      })

      return true
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err)
      }
      useSweetAlert({
        title: 'Error',
        text: 'No se pudo agregar el producto',
        icon: 'error',
        timer: 3000,
      })
      return false
    }
  }

  /**
   * Actualizar cantidad con feedback
   */
  const updateQuantity = async (branchVariantId: number, quantity: number) => {
    try {
      await cartStore.updateItemQuantity(branchVariantId, quantity)
      return true
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err)
      }
      useSweetAlert({
        title: 'Error',
        text: 'No se pudo actualizar la cantidad',
        icon: 'error',
        timer: 3000,
      })
      return false
    }
  }

  /**
   * Eliminar item con confirmación
   */
  const removeItem = async (branchVariantId: number) => {
    try {
      await cartStore.removeItem(branchVariantId)

      useSweetAlertToast({
        title: 'Eliminado',
        text: 'Producto eliminado del carrito',
        icon: 'success',
        timer: 2000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      })

      return true
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err)
      }
      useSweetAlert({
        title: 'Error',
        text: 'No se pudo eliminar el producto',
        icon: 'error',
        timer: 3000,
      })
      return false
    }
  }

  /**
   * Vaciar carrito con confirmación
   */
  const clearCart = async () => {
    try {
      await cartStore.clearCart()

      useSweetAlert({
        title: 'Carrito vaciado',
        text: 'Se eliminaron todos los productos',
        icon: 'success',
        timer: 2000,
      })

      return true
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err)
      }
      useSweetAlert({
        title: 'Error',
        text: 'No se pudo vaciar el carrito',
        icon: 'error',
        timer: 3000,
      })
      return false
    }
  }

  return {
    // ✅ State reactivo (usando storeToRefs)
    items,
    totals,
    itemsCount,
    isEmpty,
    hasItems,
    isLoading,
    isDrawerOpen,

    // ✅ Store methods (sin storeToRefs porque son funciones)
    loadCart: cartStore.loadCart,
    isInCart: cartStore.isInCart,
    getItemQuantity: cartStore.getItemQuantity,
    toggleDrawer: cartStore.toggleDrawer,
    openDrawer: cartStore.openDrawer,
    closeDrawer: cartStore.closeDrawer,

    // Enhanced methods with feedback
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  }
}
