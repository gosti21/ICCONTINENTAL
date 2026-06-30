import { MOVEMENT_REASON_TYPES_VALUES } from '@/config/const/movementReasonType'
import { MOVEMENT_TYPES_VALUES } from '@/config/const/movementType'
import { array, number, object, string } from 'yup'

export const createMovementSchema = object({
  type: string()
    .oneOf(MOVEMENT_TYPES_VALUES, 'Tipo inválido')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El tipo es obligatorio'),
  reason: string()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .oneOf(MOVEMENT_REASON_TYPES_VALUES, 'Razón inválido')
    .required('La razón es obligatoria'),
  detail_transaction: string()
    .notRequired()
    .nullable()
    .min(3, 'Debe contener al menos 3 caracteres')
    .max(180, 'Debe contener menos de 180 caracteres')
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  variants: array()
    .required('Debe enviar al menos una variante')
    .min(1, 'Debe enviar al menos una variante')
    .test('unique-branch-variant', 'No se permiten variantes duplicadas', (variants) => {
      if (!variants) return true
      const ids = variants.map((v) => v.branch_variant_id)
      return ids.length === new Set(ids).size
    })
    .of(
      object({
        branch_variant_id: number()
          .nullable()
          .transform((value, originalValue) => (originalValue === '' ? null : value))
          .required('La variante es obligatoria'),

        quantity: number()
          .integer('Debe ser un entero')
          .required('La cantidad es obligatoria')
          .moreThan(0, 'Debe ser mayor a 0')
          .typeError('Debe ser un número'),
      }),
    ),
})
