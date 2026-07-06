import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { variantI, variantsI } from '@/interfaces/admin/variant/variantInterface'
import type { variantShortsI } from '@/interfaces/admin/variant/variantShortInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'
import type { variantEditDTO } from '@/DTOs/admin/editVariantDTO'

class VariantService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(page: number = 1, perPage: number = 15): Promise<variantsI> {
    const res = await this.api.get<variantsI>('/admin/variants', {
      params: {
        page,
        per_page: perPage,
      },
    })
    console.log(res.data.message)
    return res.data
  }

  async getById(id: string): Promise<variantI> {
    const res = await this.apiStrict.get<ApiListResponseI<variantI>>(`/admin/variants/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async getAllShort(id: string): Promise<variantShortsI> {
    const res = await this.api.get<variantShortsI>(`/admin/variants/product/${id}/short`)
    console.log(res.data.message)
    return res.data
  }

  async updateStatus(data: Record<string, boolean>, id: string): Promise<variantI> {
    const res = await this.api.patch<ApiListResponseI<variantI>>(`/admin/variants/${id}`, data)
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: variantEditDTO | FormData, id: string): Promise<variantI> {
    const isFormData = data instanceof FormData
    const res = await this.api.patch<ApiListResponseI<variantI>>(`/admin/variants/${id}`, data, {
      headers: isFormData
        ? {
            'Content-Type': 'multipart/form-data',
          }
        : undefined,
    })
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: FormData): Promise<variantI> {
    const res = await this.api.post<ApiListResponseI<variantI>>('/admin/variants', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    console.log(res.data.message)
    return res.data.data
  }
}

export default VariantService
