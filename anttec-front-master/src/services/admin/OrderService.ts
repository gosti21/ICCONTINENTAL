import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'
import type { orderI, ordersI } from '@/interfaces/admin/OrderInterface'
import type { orderUpdateDTO } from '@/DTOs/admin/OrderUpdateDTO'

class OrderService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(page: number = 1, perPage: number = 15): Promise<ordersI> {
    const res = await this.api.get<ordersI>('/admin/orders', {
      params: {
        page,
        per_page: perPage,
      },
    })
    console.log(res.data.message)
    return res.data
  }

  async getPdf(id: string | number): Promise<Blob> {
    const res = await this.apiStrict.get<Blob>(`/admin/orders/${id}/pdf`, {
      responseType: 'blob',
    })
    return res.data
  }

  async update(data: orderUpdateDTO, id: string | number): Promise<orderI> {
    const res = await this.api.patch<ApiListResponseI<orderI>>(`/admin/orders/${id}`, data)
    console.log(res.data.message)
    return res.data.data
  }
}

export default OrderService
