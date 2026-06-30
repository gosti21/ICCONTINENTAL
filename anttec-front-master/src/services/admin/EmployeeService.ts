import type { categoryUpdateDTO } from '@/DTOs/admin/category/CategoryUpdateDTO'
import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import httpAdmin from '../httpAdmin'
import httpStrict from '../httpStrict'
import type { employeesShortI } from '@/interfaces/admin/employee/employeeShortInterface'
import type { employeeI } from '@/interfaces/admin/employee/employeeInterface'
import type { employeeCreateDTO } from '@/DTOs/admin/employee/EmployeeCreateDTO'

class EmployeeService {
  private get api() {
    return httpAdmin
  }

  private get apiStrict() {
    return httpStrict
  }

  async getAll(page: number = 1, perPage: number = 15): Promise<employeesShortI> {
    const res = await this.api.get<employeesShortI>('/admin/employees', {
      params: {
        page,
        per_page: perPage,
      },
    })
    console.log(res.data.message)
    return res.data
  }

  async getById(id: string): Promise<employeeI> {
    const res = await this.apiStrict.get<ApiListResponseI<employeeI>>(`/admin/employees/${id}`)
    console.log(res.data.message)
    return res.data.data
  }

  async create(data: employeeCreateDTO): Promise<employeeI> {
    const res = await this.api.post<ApiListResponseI<employeeI>>('/admin/employees', data)
    console.log(res.data.message)
    return res.data.data
  }

  async update(data: categoryUpdateDTO, id: string): Promise<employeeI> {
    const res = await this.api.patch<ApiListResponseI<employeeI>>(`/admin/employees/${id}`, data)
    console.log(res.data.message)
    return res.data.data
  }
}

export default EmployeeService
