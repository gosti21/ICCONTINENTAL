import httpAdmin from '../httpAdmin'
import type { salesI } from '@/interfaces/admin/SaleInterface'

class SaleService {
  private get api() {
    return httpAdmin
  }

  async getAll(page: number = 1, perPage: number = 15): Promise<salesI> {
    const res = await this.api.get<salesI>('/admin/sales', {
      params: {
        page,
        per_page: perPage,
      },
    })
    console.log(res.data.message)
    return res.data
  }
}

export default SaleService
