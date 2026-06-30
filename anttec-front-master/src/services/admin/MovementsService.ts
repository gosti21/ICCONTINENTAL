import type { movementCreateDTO } from '@/DTOs/admin/movement/MovementCreateDTO'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import type { movementI } from '@/interfaces/admin/movement/MovementInterface'
import type { movementsShortI } from '@/interfaces/admin/movement/MovementShortInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'

class MovementsService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(page: number = 1, perPage: number = 15): Promise<movementsShortI> {
    const res = await this.api.get<movementsShortI>('/admin/movements', {
      params: {
        page,
        per_page: perPage,
      },
    })
    console.log(res.data.message)
    return res.data
  }

  async create(data: movementCreateDTO): Promise<movementI> {
    const res = await this.api.post<ApiListResponseI<movementI>>('/admin/movements', data)
    console.log(res.data.message)
    return res.data.data
  }

  async getById(id: string | number): Promise<movementI> {
    const res = await this.apiStrict.get<ApiListResponseI<movementI>>(`/admin/movements/${id}`)
    console.log(res.data.message)
    return res.data.data
  }
}

export default MovementsService
