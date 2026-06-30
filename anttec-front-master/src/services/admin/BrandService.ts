import type { brandUpdateDTO } from '@/DTOs/admin/brand/BrandUpdateDTO'
import type { categoryCreateDTO } from '@/DTOs/admin/category/CategoryCreateDTO'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { brandI, brandsI } from '@/interfaces/admin/BrandInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'

class BrandService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }
  async getAll(page: number = 1, perPage: number = 15): Promise<brandsI> {

    const res = await this.api.get<brandsI>('/admin/brands', {
      params: {
        page,
        per_page: perPage,
      },
    })
    console.log(res.data.message)
    return res.data
  }

  async getById(id: string): Promise<brandI> {
    const res = await this.apiStrict.get<ApiListResponseI<brandI>>(`/admin/brands/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: categoryCreateDTO): Promise<brandI> {
    const res = await this.api.post<ApiListResponseI<brandI>>('/admin/brands', data)
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: brandUpdateDTO, id: string): Promise<brandI> {
    const res = await this.api.patch<ApiListResponseI<brandI>>(`/admin/brands/${id}`, data)
    console.log(res.data.message)
    return res.data.data
  }

  async getAllList(): Promise<brandI[]> {
    const res = await this.api.get<ApiListResponseI<brandI[]>>('/admin/brands/list')
    console.log(res.data.message)
    return res.data.data
  }
}

export default BrandService
