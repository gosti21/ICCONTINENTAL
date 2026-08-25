// src/composables/useCart.ts - CORREGIDO

import { useCartStore } from '@/stores/useCartStore'
import { useSweetAlert } from './useSweetAlert'
import axios from 'axios'
import { useSweetAlertToast } from './useSweetAlertToast'
import { storeToRefs } from 'pinia' // ← IMPORTAR ESTO
import Swal from 'sweetalert2'

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

      void Swal.fire({
        title: quantity === 1 ? 'Producto agregado' : 'Productos agregados',
        html: `<span class="cart-toast__message"><strong>${quantity}</strong> ${quantity === 1 ? 'unidad está' : 'unidades están'} lista${quantity === 1 ? '' : 's'} en tu carrito</span>`,
        icon: 'success',
        iconColor: '#f97316',
        timer: 3500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: true,
        confirmButtonText: 'Ver carrito',
        showCloseButton: true,
        customClass: {
          popup: 'cart-toast',
          icon: 'cart-toast__icon',
          title: 'cart-toast__title',
          htmlContainer: 'cart-toast__content',
          confirmButton: 'cart-toast__button',
          timerProgressBar: 'cart-toast__progress',
          closeButton: 'cart-toast__close',
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) cartStore.openDrawer()
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
