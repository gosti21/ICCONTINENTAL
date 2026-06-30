import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'
import type { courierI, couriersI } from '@/interfaces/admin/CourierInterface'
import type { courierCreateDTO } from '@/DTOs/admin/courier/CourierCreateDTO'
import type { courierUpdateDTO } from '@/DTOs/admin/courier/CourierUpdateDTO'

class CourierService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(): Promise<couriersI> {
    const res = await this.api.get<couriersI>('/admin/couriers')
    console.log(res.data.message)
    return res.data
  }

  async getById(id: string): Promise<courierI> {
    const res = await this.apiStrict.get<ApiListResponseI<courierI>>(`/admin/couriers/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: courierCreateDTO): Promise<courierI> {
    const res = await this.api.post<ApiListResponseI<courierI>>('/admin/couriers', data)
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: courierUpdateDTO, id: string): Promise<courierI> {
    const res = await this.api.patch<ApiListResponseI<courierI>>(`/admin/couriers/${id}`, data)
    console.log(res.data.message)
    return res.data.data
  }

  async getAllList(): Promise<courierI[]> {
    const res = await this.api.get<ApiListResponseI<courierI[]>>('/admin/couriers/list')
    console.log(res.data.message)
    return res.data.data
  }
}

export default CourierService
