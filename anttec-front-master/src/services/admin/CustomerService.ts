import type { customersI } from '@/interfaces/admin/CustomerInterface'
import httpAdmin from '../httpAdmin'

class CustomerService {
  private get api() {
    return httpAdmin
  }

  async getAll(typeCustomer?: string): Promise<customersI> {
    const res = await this.api.get<customersI>('/admin/customers', {
      params: { type_customer: typeCustomer },
    })
    console.log(res.data.message)
    return res.data
  }
}

export default CustomerService
