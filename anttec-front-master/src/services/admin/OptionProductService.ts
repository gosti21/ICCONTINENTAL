import type { addValuesDTO } from '@/DTOs/admin/productOption/addValuesDTO'
import type { productOptionCreateDTO } from '@/DTOs/admin/productOption/ProductOptionCreateDTO'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { OptionProductI } from '@/interfaces/admin/optionProduct/OptionProductInterface'
import type { OptionProductShortI } from '@/interfaces/admin/optionProduct/OptionProductShortInterface'
import type { OptionProductValuesI } from '@/interfaces/admin/optionProduct/OptionProductValuesInterface'
import httpAdmin from '../httpAdmin'

class OptionProductService {
  private get api() {
    return httpAdmin
  }

  async getById(id: string): Promise<OptionProductI> {
    const res = await this.api.get<ApiListResponseI<OptionProductI>>(`/admin/option-products/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: productOptionCreateDTO): Promise<OptionProductShortI> {
    const res = await this.api.post<ApiListResponseI<OptionProductShortI>>(
      '/admin/option-products',
      data,
    )
    console.log(res.data.message)
    return res.data.data
  }

  async addValues(data: addValuesDTO): Promise<OptionProductShortI> {
    const res = await this.api.post<ApiListResponseI<OptionProductShortI>>(
      '/admin/option-products/values',
      data,
    )
    console.log(res.data.message)
    return res.data.data
  }

  async getAllValues(
    productId: string | number,
    optionId: string | number,
  ): Promise<OptionProductValuesI[]> {
    const res = await this.api.get<ApiListResponseI<OptionProductValuesI[]>>(
      `/admin/option-products/${productId}/values/${optionId}`,
    )
    console.log(res.data.message)
    return res.data.data
  }
}

export default OptionProductService
