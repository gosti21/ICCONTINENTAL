import { array, mixed, number, object } from 'yup'

export const editVariantSchema = object({
  selling_price: number()
    .optional()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El precio de venta es obligatorio')
    .moreThan(0, 'El precio de venta debe ser mayor a 0')
    .test('decimal-2', 'El precio de venta debe tener máximo 2 decimales', (value) => {
      if (value === undefined) return true
      return /^\d+(\.\d{1,2})?$/.test(value.toString())
    }),

  purcharse_price: number()
    .optional()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El precio de compra es obligatorio')
    .moreThan(0, 'El precio de compra debe ser mayor a 0')
    .test('decimal-2', 'El precio de compra debe tener máximo 2 decimales', (value) => {
      if (value === undefined) return true
      return /^\d+(\.\d{1,2})?$/.test(value.toString())
    }),

  stock_min: number()
    .optional()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('Stock mínimo es obligatorio')
    .integer('Debe ser un número entero')
    .moreThan(0, 'El stock mínimo debe ser mayor a 0'),

  images: array()
    .of(
      object({
        image: mixed<File | Blob>().required(),
      }),
    )
    .optional(),
})
