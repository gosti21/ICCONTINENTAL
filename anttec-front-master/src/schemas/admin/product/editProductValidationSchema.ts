import { array, boolean, number, object, string } from 'yup'

export const editProductSchema = object({
  name: string()
    .optional()
    .required('El nombre es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(100, 'Debe contener menos de 100 caracteres'),
  model: string()
    .optional()
    .required('El modelo es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(80, 'Debe contener menos de 80 caracteres'),
  description: string()
    .notRequired()
    .nullable()
    .min(10, 'Debe de contener más de 10 caracteres')
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  status: boolean().optional(),
  subcategory_id: number()
    .optional()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .when('category_id', {
      is: (val: number | null) => !!val, // solo obligatorio si hay categoría seleccionada
      then: (schema) => schema.required('La subcategoría es obligatoria'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  category_id: number()
    .optional()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('La categoría es obligatoria'),
  brand_id: number()
    .optional()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('La marca es obligatoria'),
  specifications: array()
    .of(
      object({
        specification_id: number()
          .nullable()
          .optional()
          .transform((value, originalValue) => (originalValue === '' ? null : value))
          .required('La especificación es obligatoria'),

        value: string()
          .optional()
          .required('El valor es obligatorio')
          .min(2, 'Debe contener al menos 2 caracteres'),
      }),
    )
    .optional()
    .required('Debes agregar al menos una especificación')
    .min(1, 'Debes agregar al menos una especificación')
    .test('unique-specification-ids', 'No puedes repetir especificaciones', (specs) => {
      if (!specs) return false
      const ids = specs.map((s) => s.specification_id)
      return ids.length === new Set(ids).size
    }),
})
