import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { categorySI } from '@/interfaces/shop/CategorySInterface'
import httpPublic from '../httpPublic'
import httpStrict from '../httpStrict'

class CategorySService {
  private get api() {
    return httpPublic
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(): Promise<categorySI[]> {
    const res = await this.api.get<ApiListResponseI<categorySI[]>>('categories')
    console.log(res.data.message)
    return res.data.data
  }

  async getById(id: string): Promise<categorySI> {
    const res = await this.apiStrict.get<ApiListResponseI<categorySI>>(`categories/${id}`)
    console.log(res.data.message)
    return res.data.data
  }
}

export default CategorySService
