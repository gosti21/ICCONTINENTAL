import type { categoryCreateDTO } from '@/DTOs/admin/category/CategoryCreateDTO'
import type { categoryUpdateDTO } from '@/DTOs/admin/category/CategoryUpdateDTO'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { categoriesI, categoryI, categorySubI } from '@/interfaces/admin/CategoryInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'

class CategoryService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(page: number = 1, perPage: number = 15): Promise<categoriesI> {
    const res = await this.api.get<categoriesI>('/admin/categories', {
      params: {
        page,
        per_page: perPage,
      },
    })
    console.log(res.data.message)
    return res.data
  }

  async getById(id: string): Promise<categoryI> {
    const res = await this.apiStrict.get<ApiListResponseI<categoryI>>(`/admin/categories/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: categoryCreateDTO): Promise<categoryI> {
    const res = await this.api.post<ApiListResponseI<categoryI>>('/admin/categories', data)
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: categoryUpdateDTO, id: string): Promise<categoryI> {
    const res = await this.api.patch<ApiListResponseI<categoryI>>(`/admin/categories/${id}`, data)
    console.log(res.data.message)
    return res.data.data
  }

  async getAllList(): Promise<categoryI[]> {
    const res = await this.api.get<ApiListResponseI<categoryI[]>>('/admin/categories/list')
    console.log(res.data.message)
    return res.data.data
  }

  async getAllSubcategories(id: string | number): Promise<categorySubI[]> {
    const res = await this.api.get<ApiListResponseI<categorySubI[]>>(
      `/admin/categories/${id}/subcategories`,
    )
    console.log(res.data.message)
    return res.data.data
  }
}

export default CategoryService
