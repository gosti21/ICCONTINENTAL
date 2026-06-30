import { boolean, number, object, string } from 'yup'

export const editCheckoutAddressSchema = object({
  department_id: number()
    .required('El departamento es obligatorio')
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  province_id: number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .when('department_id', {
      is: (val: number | null) => !!val,
      then: (schema) => schema.required('La provincia es obligatoria'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  district_id: number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .when('province_id', {
      is: (val: number | null) => !!val,
      then: (schema) => schema.required('El distrito es obligatorio'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  street: string()
    .optional()
    .required('El nombre es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(150, 'Debe contener menos de 150 caracteres'),
  street_number: number()
    .optional()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El número de calle obligatorio')
    .integer('Debe ser un número entero'),
  reference: string()
    .optional()
    .required('La referencia es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(150, 'Debe contener menos de 150 caracteres'),
  favorite: boolean().optional(),
})
