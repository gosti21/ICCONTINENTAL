import type { movementVariantI } from './MovementVariantInterface'

export interface movementI {
  id: number | string
  type: string
  reason: string
  detail_transaction?: string | null
  date: string
  time: string
  variants: movementVariantI[]
}
