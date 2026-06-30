import type { provinceCreateDTO } from '@/DTOs/admin/province/ProvinceCreateDTO'
import type { provinceUpdateDTO } from '@/DTOs/admin/province/ProvinceUpdateDTO'
import type { provinceI, provincesI } from '@/interfaces/admin/address/provinceInterface'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'

class ProvinceService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(): Promise<provincesI> {
    const res = await this.api.get<provincesI>('/admin/provinces')
    console.log(res.data.message)
    return res.data
  }

  async getById(id: string): Promise<provinceI> {
    const res = await this.apiStrict.get<ApiListResponseI<provinceI>>(`/admin/provinces/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: provinceUpdateDTO, id: string): Promise<provinceI> {
    const res = await this.api.patch<ApiListResponseI<provinceI>>(`/admin/provinces/${id}`, data)
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: provinceCreateDTO): Promise<provinceI> {
    const res = await this.api.post<ApiListResponseI<provinceI>>('/admin/provinces', data)
    console.log(res.data.message)
    return res.data.data
  }
}

export default ProvinceService
