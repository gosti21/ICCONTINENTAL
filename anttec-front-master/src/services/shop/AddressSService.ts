import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { addressSI } from '@/interfaces/shop/AddressSInterface'
import httpAdmin from '../httpAdmin'
import type { addressCheckoutCreateDTO } from '@/DTOs/shop/address/AddressCheckoutCreateDTO'
import type { addressCheckoutUpdateDTO } from '@/DTOs/shop/address/AddressCheckoutUpdateDTO'
import type { addressExtendSI } from '@/interfaces/shop/AddressExtendSInterface'

class AddressSService {
  private get api() {
    return httpAdmin
  }

  async getAll(): Promise<addressSI[]> {
    const res = await this.api.get<ApiListResponseI<addressSI[]>>('/checkout/address')
    console.log(res.data.message)
    return res.data.data
  }

  async getById(id: string | number): Promise<addressExtendSI> {
    const res = await this.api.get<ApiListResponseI<addressExtendSI>>(`/checkout/address/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async favorite(): Promise<addressSI> {
    const res = await this.api.get<ApiListResponseI<addressSI>>('/checkout/address/favorite')
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: addressCheckoutCreateDTO): Promise<addressSI> {
    const res = await this.api.post<ApiListResponseI<addressSI>>('/checkout/address', data)
    console.log(res.data.message)
    return res.data.data
  }

  async update(id: string | number, data: addressCheckoutUpdateDTO): Promise<addressExtendSI> {
    const res = await this.api.patch<ApiListResponseI<addressExtendSI>>(
      `/checkout/address/${id}`,
      data,
    )
    console.log(res.data.message)
    return res.data.data
  }

  async delete(id: string | number): Promise<string> {
    const res = await this.api.delete<ApiListResponseI<void>>(`/checkout/address/${id}`)
    console.log(res.data.message)
    return res.data.message
  }
}

export default AddressSService
