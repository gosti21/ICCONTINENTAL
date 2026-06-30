import type { DashboardStatsI, SalesChartI, TopItemsI } from '@/interfaces/admin/DashboardInterface'
import httpAdmin from '../httpAdmin'

class DashboardService {
  private get api() {
    return httpAdmin
  }

  async getStats(): Promise<DashboardStatsI> {
    const res = await this.api.get<DashboardStatsI>('/admin/dashboard/stats')
    return res.data
  }

  async getSalesChart(): Promise<SalesChartI> {
    const res = await this.api.get<SalesChartI>('/admin/dashboard/sales-chart')
    return res.data
  }

  async getTopVariants(): Promise<TopItemsI> {
    const res = await this.api.get<TopItemsI>('/admin/dashboard/top-variants')
    return res.data
  }

  async getTopCategories(): Promise<TopItemsI> {
    const res = await this.api.get<TopItemsI>('/admin/dashboard/top-categories')
    return res.data
  }

  async getTopBrands(): Promise<TopItemsI> {
    const res = await this.api.get<TopItemsI>('/admin/dashboard/top-brands')
    return res.data
  }
}

export default DashboardService
