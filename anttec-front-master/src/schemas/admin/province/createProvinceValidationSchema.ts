import { number, object, string } from 'yup'

export const createProvinceSchema = object({
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
})
