import type { shipmentI, shipmentsI } from '@/interfaces/admin/ShipmentInterface'
import httpAdmin from '../httpAdmin'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { shipmentUpdateDTO } from '@/DTOs/admin/ShipmentUpdateDTO'

class ShipmentService {
  private get api() {
    return httpAdmin
  }

  async getAll(page: number = 1, perPage: number = 15): Promise<shipmentsI> {
    const res = await this.api.get<shipmentsI>('/admin/shipments', {
      params: {
        page,
        per_page: perPage,
      },
    })
    console.log(res.data.message)
    return res.data
  }

  async update(data: shipmentUpdateDTO, id: string | number): Promise<shipmentI> {
    const res = await this.api.patch<ApiListResponseI<shipmentI>>(`/admin/shipments/${id}`, data)
    console.log(res.data.message)
    return res.data.data
  }
}

export default ShipmentService
