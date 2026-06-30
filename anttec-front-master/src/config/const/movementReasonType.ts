export const MOVEMENT_REASON_TYPES = [
  { value: 'purchase', label: 'Compra' },
  { value: 'return', label: 'Devolución' },
  { value: 'adjustment', label: 'Ajuste' },
  { value: 'other', label: 'Otros' },
] as const

// Si quieres solo los valores para Yup:
export const MOVEMENT_REASON_TYPES_VALUES = MOVEMENT_REASON_TYPES.map((t) => t.value)

export type MovementReason = (typeof MOVEMENT_REASON_TYPES)[number]['value']
