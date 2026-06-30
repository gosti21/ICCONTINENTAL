export const OPTION_TYPES = [
  { value: 'color', label: 'Color' },
  { value: 'text', label: 'Texto' },
] as const

// Si quieres solo los valores para Yup:
export const OPTION_TYPE_VALUES = OPTION_TYPES.map((t) => t.value)
