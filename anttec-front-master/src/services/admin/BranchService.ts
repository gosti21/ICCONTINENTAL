import type { branchesI } from '@/interfaces/admin/branch/BranchInterface'
import httpAdmin from '../httpAdmin'

class BranchService {
  private get api() {
    return httpAdmin
  }

  async getAll(): Promise<branchesI> {
    const res = await this.api.get<branchesI>('/admin/branches')
    console.log(res.data.message)
    return res.data
  }
}

export default BranchService
