import httpAdmin from '../httpAdmin'
import type { branchSI } from '@/interfaces/shop/BranchSInterface'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'

class BranchSService {
  private get api() {
    return httpAdmin
  }

  async getAll(): Promise<branchSI> {
    const res = await this.api.get<ApiListResponseI<branchSI>>('/branches')
    console.log(res.data.message)
    return res.data.data
  }
}

export default BranchSService
