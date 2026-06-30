import { array, mixed, number, object } from 'yup'

export const createVariantSchema = object({
  selling_price: number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El precio de venta es obligatorio')
    .moreThan(0, 'El precio de venta debe ser mayor a 0')
    .test('decimal-2', 'El precio de venta debe tener máximo 2 decimales', (value) => {
      if (value === undefined) return true
      return /^\d+(\.\d{1,2})?$/.test(value.toString())
    }),

  purcharse_price: number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El precio de compra es obligatorio')
    .moreThan(0, 'El precio de compra debe ser mayor a 0')
    .test('decimal-2', 'El precio de compra debe tener máximo 2 decimales', (value) => {
      if (value === undefined) return true
      return /^\d+(\.\d{1,2})?$/.test(value.toString())
    }),

  stock_min: number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('Stock mínimo es obligatorio')
    .integer('Debe ser un número entero')
    .moreThan(0, 'El stock mínimo debe ser mayor a 0'),

  images: array()
    .required('Debe subir al menos una imagen')
    .min(1, 'Debe subir al menos una imagen')
    .of(
      object({
        image: mixed<File>()
          .required('La imagen es obligatoria')
          .test('fileType', 'Debe ser una imagen', (file) =>
            file ? file.type.startsWith('image/') : false,
          ),
      }),
    ),
  features: array()
    .required('Debe agregar al menos una característica')
    .min(1, 'Debe agregar al menos una característica')
    .of(
      object({
        option_product_id: number()
          .nullable()
          .transform((value, originalValue) => (originalValue === '' ? null : value))
          .required('La opción es obligatoria'),

        option_product_value_id: number()
          .nullable()
          .transform((value, originalValue) => (originalValue === '' ? null : value))
          .required('El valor es obligatorio'),
      }),
    )
    .test('distinct-features', 'No se permiten características repetidas', (features) => {
      if (!features) return true

      const seen = new Set<string>()

      for (const feature of features) {
        const key = `${feature.option_product_id}-${feature.option_product_value_id}`
        if (seen.has(key)) return false
        seen.add(key)
      }

      return true
    }),
})
