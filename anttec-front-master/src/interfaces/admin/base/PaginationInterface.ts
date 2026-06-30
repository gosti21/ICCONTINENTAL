import type { baseResponseI } from './BaseResponseInterface'

export interface paginationLinksI {
  first: string
  last: string
  prev: string | null
  next: string | null
}

export interface paginationMetaLinkI {
  url: string | null
  label: string
  active: boolean
}

export interface paginationMetaI {
  current_page: number
  from: number
  last_page: number
  links: paginationMetaLinkI[]
  path: string
  per_page: number
  to: number
  total: number
}

export interface paginatedResponseI<T> extends baseResponseI {
  data: T[]
  links: paginationLinksI
  meta: paginationMetaI
}
