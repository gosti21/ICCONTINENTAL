import type { countriesI } from '@/interfaces/admin/address/countryInterface'
import type { generalI } from '@/interfaces/admin/address/generalnterface'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import httpAdmin from '../httpAdmin'

class CountryService {
  private get api() {
    return httpAdmin
  }

  async getAll(): Promise<countriesI> {
    const res = await this.api.get<countriesI>('/admin/countries')
    console.log(res.data.message)
    return res.data
  }

  async getAllList(): Promise<generalI[]> {
    const res = await this.api.get<ApiListResponseI<generalI[]>>('/admin/countries/list')
    console.log(res.data.message)
    return res.data.data
  }

  async getAllDepartments(id: string | number): Promise<generalI[]> {
    const res = await this.api.get<ApiListResponseI<generalI[]>>(
      `/admin/countries/${id}/departments`,
    )
    console.log(res.data.message)
    return res.data.data
  }
}

export default CountryService
