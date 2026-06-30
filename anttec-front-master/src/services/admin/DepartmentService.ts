import type { departmentCreateDTO } from '@/DTOs/admin/department/DepartmentCreateDTO'
import type { departmentUpdateDTO } from '@/DTOs/admin/department/DepartmentUpdateDTO'
import type { departmentI, departmentsI } from '@/interfaces/admin/address/departmentInterface'
import type { generalI } from '@/interfaces/admin/address/generalnterface'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'

class DepartmentService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(): Promise<departmentsI> {
    const res = await this.api.get<departmentsI>('/admin/departments')
    console.log(res.data.message)
    return res.data
  }

  async getById(id: string): Promise<departmentI> {
    const res = await this.apiStrict.get<ApiListResponseI<departmentI>>(`/admin/departments/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: departmentCreateDTO): Promise<departmentI> {
    const res = await this.api.post<ApiListResponseI<departmentI>>('/admin/departments', data)
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: departmentUpdateDTO, id: string): Promise<departmentI> {
    const res = await this.api.patch<ApiListResponseI<departmentI>>(
      `/admin/departments/${id}`,
      data,
    )
    console.log(res.data.message)
    return res.data.data
  }

  async getAllProvinces(id: string | number): Promise<generalI[]> {
    const res = await this.api.get<ApiListResponseI<generalI[]>>(
      `/admin/departments/${id}/provinces`,
    )
    console.log(res.data.message)
    return res.data.data
  }
}

export default DepartmentService
