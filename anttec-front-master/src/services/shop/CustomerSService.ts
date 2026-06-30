import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import httpAdmin from '../httpAdmin'
import type { customerDNISI } from '@/interfaces/shop/Customer/CustomerDNISInterface'
import type { customerRUCSI } from '@/interfaces/shop/Customer/CustomerRUCSInterface'

class CustomerSService {
  private get api() {
    return httpAdmin
  }

  async getByDNI(dni: string | number): Promise<customerDNISI> {
    const res = await this.api.get<ApiListResponseI<customerDNISI>>(`/customers/dni/${dni}`, )
    console.log(res.data.message)
    return res.data.data
  }

  async getByRUC(ruc: string | number): Promise<customerRUCSI> {
    const res = await this.api.get<ApiListResponseI<customerRUCSI>>(`/customers/ruc/${ruc}`)
    console.log(res.data.message)
    return res.data.data
  }
}

export default CustomerSService
