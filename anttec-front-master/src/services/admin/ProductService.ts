import type { productCreateDTO } from '@/DTOs/admin/product/ProductCreateDTO'
import type { productUpdateDTO } from '@/DTOs/admin/product/ProductUpdateDTO'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { OptionProductI } from '@/interfaces/admin/optionProduct/OptionProductInterface'
import type { ProductHasOptionsI } from '@/interfaces/admin/product/ProductHasOptionsInterface'
import type { ProductExtendI, ProductsI } from '@/interfaces/admin/product/ProductInterface'
import type { ProductOptionListI } from '@/interfaces/admin/product/ProductOptionListInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'

class ProductService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(page: number = 1, perPage: number = 15): Promise<ProductsI> {
    const res = await this.api.get<ProductsI>('/admin/products', {
      params: {
        page,
        per_page: perPage,
      },
    })
    console.log(res.data.message)
    return res.data
  }

  async create(data: productCreateDTO): Promise<ProductExtendI> {
    const res = await this.api.post<ApiListResponseI<ProductExtendI>>('/admin/products', data)
    console.log(res.data.message)
    return res.data.data
  }

  async getById(id: string): Promise<ProductExtendI> {
    const res = await this.apiStrict.get<ApiListResponseI<ProductExtendI>>(`/admin/products/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: productUpdateDTO, id: string): Promise<ProductExtendI> {
    const res = await this.api.patch<ApiListResponseI<ProductExtendI>>(
      `/admin/products/${id}`,
      data,
    )
    console.log(res.data.message)
    return res.data.data
  }

  async getOptions(id: string): Promise<OptionProductI[]> {
    const res = await this.api.get<ApiListResponseI<OptionProductI[]>>(
      `/admin/products/${id}/options`,
    )
    console.log(res.data.message)
    return res.data.data
  }

  async hasOptions(id: string): Promise<string> {
    const res = await this.api.get<ProductHasOptionsI>(`/admin/products/${id}/hasOptions`)
    console.log(res.data.message)
    return res.data.message
  }

  async getAllOptionsList(id: string): Promise<ProductOptionListI[]> {
    const res = await this.api.get<ApiListResponseI<ProductOptionListI[]>>(
      `/admin/products/${id}/optionsList`,
    )
    console.log(res.data.message)
    return res.data.data
  }
}

export default ProductService
