import type { baseResponseI } from './BaseResponseInterface'

export interface ApiListResponseI<T> extends baseResponseI {
  data: T
}
