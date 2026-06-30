import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { branchVariantI } from '@/interfaces/admin/BranchVariantInterface'
import httpAdmin from '../httpAdmin'

class BranchVariantService {
  private get api() {
    return httpAdmin
  }

  async getAllList(): Promise<branchVariantI[]> {
    const res = await this.api.get<ApiListResponseI<branchVariantI[]>>(
      '/admin/branch-variants/list',
    )
    console.log(res.data.message)
    return res.data.data
  }
}

export default BranchVariantService
