import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { coverSI } from '@/interfaces/shop/CoverSInterface'
import httpPublic from '../httpPublic'

class CoverSService {
  private get api() {
    return httpPublic
  }

  async getAll(): Promise<coverSI[]> {
    const res = await this.api.get<ApiListResponseI<coverSI[]>>('covers')
    console.log(res.data.message)
    return res.data.data
  }
}

export default CoverSService
