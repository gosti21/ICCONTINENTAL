import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { paymentSessionTokenSI } from '@/interfaces/shop/PaymentSessionTokenInterface'
import httpAdmin from '../httpAdmin'
import type { confirmOrderDTO } from '@/DTOs/shop/ConfirmOrderDTO'

class PaymentSService {
  private get api() {
    return httpAdmin
  }

  async createOrderSessionToken(data: confirmOrderDTO): Promise<paymentSessionTokenSI> {
    const res = await this.api.post<ApiListResponseI<paymentSessionTokenSI>>('/orders', data)
    console.log(res.data.message)
    return res.data.data
  }
}

export default PaymentSService
