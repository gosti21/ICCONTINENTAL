import type { cartAddItemDTO } from '@/DTOs/shop/cart/CartAddItemDTO'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { cartResponseSI } from '@/interfaces/shop/Cart/CartSInterface'
import httpPublic from '../httpPublic'
import type { cartUpdateItemDTO } from '@/DTOs/shop/cart/CartUpdateItemDTO'
import type {
  addItemResponseSI,
  removeItemResponseI,
  updateItemResponseSI,
} from '@/interfaces/shop/Cart/DetailCartSInterface'

class CartSService {
  private get api() {
    return httpPublic
  }

  async getCart(sessionId: string): Promise<cartResponseSI> {
    const res = await this.api.get<ApiListResponseI<cartResponseSI>>('cart', {
      headers: {
        'X-Session-ID': sessionId,
      },
    })
    console.log(res.data.message)
    return res.data.data
  }

  async addItem(sessionId: string, data: cartAddItemDTO): Promise<addItemResponseSI> {
    const res = await this.api.post<ApiListResponseI<addItemResponseSI>>('cart/addItem', data, {
      headers: {
        'X-Session-ID': sessionId,
      },
    })
    console.log(res.data.message)
    return res.data.data
  }

  async updateItemQuantity(
    sessionId: string,
    branchVariantId: number,
    data: cartUpdateItemDTO,
  ): Promise<updateItemResponseSI> {
    const res = await this.api.put<ApiListResponseI<updateItemResponseSI>>(
      `cart/updateItem/${branchVariantId}`,
      data,
      {
        headers: {
          'X-Session-ID': sessionId,
        },
      },
    )
    console.log(res.data.message)
    return res.data.data
  }

  async removeItem(sessionId: string, branchVariantId: number): Promise<removeItemResponseI> {
    const res = await this.api.delete<ApiListResponseI<removeItemResponseI>>(
      `cart/removeItem/${branchVariantId}`,
      {
        headers: {
          'X-Session-ID': sessionId,
        },
      },
    )
    console.log(res.data.message)
    return res.data.data
  }

  async clearCart(sessionId: string): Promise<string> {
    const res = await this.api.delete<ApiListResponseI<void>>('cart/delete', {
      headers: {
        'X-Session-ID': sessionId,
      },
    })
    console.log(res.data.message)
    return res.data.message
  }

  async mergeCart(sessionId: string): Promise<cartResponseSI> {
    const res = await this.api.post<ApiListResponseI<cartResponseSI>>('cart/merge', {
      session_id: sessionId,
    })
    console.log(res.data.message)
    return res.data.data
  }
}

export default CartSService
