import type { districtUpdateDTO } from '@/DTOs/admin/district/DistrictUpdateDTO'
import type { districtI } from '@/interfaces/admin/address/districtInterface'
import type { districtShortsI } from '@/interfaces/admin/address/districtShortInterface'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import httpAdmin from '../httpAdmin'
import type { districtCreateDTO } from '@/DTOs/admin/district/DistrictCreateDTO'
import httpStrict from '../httpStrict'

class DistrictService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(): Promise<districtShortsI> {
    const res = await this.api.get<districtShortsI>('/admin/districts')
    console.log(res.data.message)
    return res.data
  }

  async getById(id: string): Promise<districtI> {
    const res = await this.apiStrict.get<ApiListResponseI<districtI>>(`/admin/districts/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: districtUpdateDTO, id: string): Promise<districtI> {
    const res = await this.api.patch<ApiListResponseI<districtI>>(`/admin/districts/${id}`, data)
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: districtCreateDTO): Promise<districtI> {
    const res = await this.api.post<ApiListResponseI<districtI>>('/admin/districts', data)
    console.log(res.data.message)
    return res.data.data
  }
}

export default DistrictService
