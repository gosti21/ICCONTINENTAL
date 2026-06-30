export const MOVEMENT_TYPES = [
  { value: 'inflow', label: 'Entrada' },
  { value: 'outflow', label: 'Salida' },
] as const

// Si quieres solo los valores para Yup:
export const MOVEMENT_TYPES_VALUES = MOVEMENT_TYPES.map((t) => t.value)

export type MovementType = (typeof MOVEMENT_TYPES)[number]['value']
