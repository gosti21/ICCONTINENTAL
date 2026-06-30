import type { MovementReason } from './movementReasonType'
import type { MovementType } from './movementType'

//regla de negocios
export const REASON_BY_TYPE: Record<MovementType, readonly MovementReason[]> = {
  inflow: ['purchase', 'return', 'adjustment', 'other'],
  outflow: ['return', 'adjustment', 'other'],
}
