import { number, object, string, ref } from 'yup'

export const createDistrictSchema = object({
  name: string()
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: 'El nombre solo puede contener letras y espacios',
      excludeEmptyString: true,
    })
    .required('El nombre es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(80, 'Debe contener menos de 80 caracteres'),
  country_id: number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El país es obligatorio'),
  department_id: number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .when('country_id', {
      is: (val: number | null) => !!val,
      then: (schema) => schema.required('El departamento es obligatorio'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  province_id: number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .when('department_id', {
      is: (val: number | null) => !!val,
      then: (schema) => schema.required('La provincia es obligatoria'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  delivery_price: number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El precio de delivery es obligatorio')
    .test('decimal-2', 'El precio de compra debe tener máximo 2 decimales', (value) => {
      if (value === undefined) return true
      return /^\d+(\.\d{1,2})?$/.test(value.toString())
    }),

  min_delivery_days: number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El mínimo de días es obligatorio')
    .integer('Debe ser un número entero')
    .min(0, 'Debe ser mayor o igual a 0'),

  max_delivery_days: number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El máximo de días es obligatorio')
    .integer('Debe ser un número entero')
    .min(0, 'Debe ser mayor o igual a 0')
    .min(ref('min_delivery_days'), 'Debe ser mayor o igual al mínimo de días'),
})
