import type { generalI } from '@/interfaces/admin/address/generalnterface'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import httpAdmin from '../httpAdmin'

class LocationSService {
  private get api() {
    return httpAdmin
  }

  async getAllDepartments(): Promise<generalI[]> {
    const res = await this.api.get<ApiListResponseI<generalI[]>>('/locations/departments')
    console.log(res.data.message)
    return res.data.data
  }

  async getAllProvinces(departmentId: string | number): Promise<generalI[]> {
    const res = await this.api.get<ApiListResponseI<generalI[]>>(
      `/locations/${departmentId}/provinces`,
    )
    console.log(res.data.message)
    return res.data.data
  }

  async getAllDistricts(provinceId: string | number): Promise<generalI[]> {
    const res = await this.api.get<ApiListResponseI<generalI[]>>(
      `/locations/${provinceId}/districts`,
    )
    console.log(res.data.message)
    return res.data.data
  }
}

export default LocationSService
