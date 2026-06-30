import type { optionCreateDTO } from '@/DTOs/admin/option/OptionCreateDTO'
import type { optionUpdateDTO } from '@/DTOs/admin/option/OptionUpdateDTO'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { OptionExtendI, OptionI, OptionsI } from '@/interfaces/admin/options/OptionInterface'
import type { OptionValueShortI } from '@/interfaces/admin/options/OptionValueInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'

class OptionService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(): Promise<OptionsI> {
    const res = await this.api.get<OptionsI>('/admin/options')
    console.log(res.data.message)
    return res.data
  }

  async create(data: optionCreateDTO): Promise<OptionI> {
    const res = await this.api.post<ApiListResponseI<OptionI>>('/admin/options', data)
    console.log(res.data.message)
    return res.data.data
  }

  async getById(id: string): Promise<OptionExtendI> {
    const res = await this.apiStrict.get<ApiListResponseI<OptionExtendI>>(`/admin/options/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: optionUpdateDTO, id: string): Promise<OptionExtendI> {
    const res = await this.api.patch<ApiListResponseI<OptionExtendI>>(`/admin/options/${id}`, data)
    console.log(res.data.message)
    return res.data.data
  }

  async getAllList(): Promise<OptionI[]> {
    const res = await this.api.get<ApiListResponseI<OptionI[]>>('/admin/options')
    console.log(res.data.message)
    return res.data.data
  }

  async getAllOptionValues(id: string | number): Promise<OptionValueShortI[]> {
    const res = await this.api.get<ApiListResponseI<OptionValueShortI[]>>(
      `/admin/options/${id}/values`,
    )
    console.log(res.data.message)
    return res.data.data
  }
}

export default OptionService
