import type { subcategoryCreateDTO } from '@/DTOs/admin/subcategory/SubcategoryCreateDTO'
import type { subcategoryUpdateDTO } from '@/DTOs/admin/subcategory/SubcategoryUpdateDTO'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { subcategoriesI, subcategoryI } from '../../interfaces/admin/SubcategoryInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'

class SubcategoryService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(page: number = 1, perPage: number = 15): Promise<subcategoriesI> {
    const res = await this.api.get<subcategoriesI>('/admin/subcategories', {
      params: {
        page,
        per_page: perPage,
      },
    })
    console.log(res.data.message)
    return res.data
  }

  async getById(id: string): Promise<subcategoryI> {
    const res = await this.apiStrict.get<ApiListResponseI<subcategoryI>>(
      `/admin/subcategories/${id}`,
    )
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: subcategoryCreateDTO): Promise<subcategoryI> {
    const res = await this.api.post<ApiListResponseI<subcategoryI>>('/admin/subcategories', data)
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: subcategoryUpdateDTO, id: string): Promise<subcategoryI> {
    const res = await this.api.patch(`/admin/subcategories/${id}`, data)
    console.log(res.data.message)
    return res.data.data as subcategoryI
  }

  async getAllList(): Promise<subcategoryI[]> {
    const res = await this.api.get<ApiListResponseI<subcategoryI[]>>('/admin/subcategories/list')
    console.log(res.data.message)
    return res.data.data
  }
}

export default SubcategoryService
