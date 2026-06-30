export interface DashboardStatsI {
  total_sales: number
  total_orders: number
  total_products: number
  total_customers: number
}

export interface SalesChartI {
  labels: string[]
  data: number[]
}

export interface TopItemI {
  name: string
  sales: number
}

export type TopItemsI = TopItemI[]
