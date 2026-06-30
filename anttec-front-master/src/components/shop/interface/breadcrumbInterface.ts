import type { RouteParamsRaw } from 'vue-router'

export interface BreadcrumbInterface {
  name: string
  route?: string
  params?: RouteParamsRaw
}
