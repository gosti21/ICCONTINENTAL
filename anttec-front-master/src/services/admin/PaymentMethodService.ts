import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { paymentMethodI } from '@/interfaces/admin/PaymentMethodInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'

class PaymentMethodService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAllList(): Promise<paymentMethodI[]> {
    const res = await this.api.get<ApiListResponseI<paymentMethodI[]>>('/admin/payment-methods')
    console.log(res.data.message)
    return res.data.data
  }

  async getById(id: string): Promise<paymentMethodI> {
    const res = await this.apiStrict.get<ApiListResponseI<paymentMethodI>>(
      `/admin/payment-methods/${id}`,
    )
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: FormData, id: string | number): Promise<paymentMethodI> {
    data.append('_method', 'PUT')
    const res = await this.api.post<ApiListResponseI<paymentMethodI>>(
      `/admin/payment-methods/${id}`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    console.log(res.data.message)
    return res.data.data
  }
}

export default PaymentMethodService
