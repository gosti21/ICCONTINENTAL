import type { coverOrderDTO } from '@/DTOs/admin/cover/CoverOrderDTO'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { coverI, coversI } from '@/interfaces/admin/CoverInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'

class CoverService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(): Promise<coversI> {
    const res = await this.api.get<coversI>('/admin/covers')
    console.log(res.data.message)
    return res.data
  }

  async getById(id: string): Promise<coverI> {
    const res = await this.apiStrict.get<ApiListResponseI<coverI>>(`/admin/covers/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async updateStatus(data: Record<string, boolean>, id: string): Promise<coverI> {
    const res = await this.api.patch<ApiListResponseI<coverI>>(`/admin/covers/${id}`, data)
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: FormData): Promise<coverI> {
    const res = await this.api.post<ApiListResponseI<coverI>>('/admin/covers', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: FormData, id: string | number): Promise<coverI> {
    data.append('_method', 'PATCH')

    const res = await this.api.post<ApiListResponseI<coverI>>(`/admin/covers/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return res.data.data
  }

  async order(data: coverOrderDTO): Promise<string> {
    const res = await this.api.post<ApiListResponseI<string>>('/admin/covers/order', data)
    console.log(res.data.message)
    return res.data.message
  }
}

export default CoverService
