import type { MovementVariantDTO } from './MovementVariantsDTO'

export interface movementCreateDTO {
  type: string | number
  reason: string | number
  detail_transaction?: string
  variants: MovementVariantDTO[]
}
