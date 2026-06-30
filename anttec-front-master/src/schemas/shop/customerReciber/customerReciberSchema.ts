import { object, string } from 'yup'

export const customerReciberSchema = object({
  name: string()
    .required('El nombre es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(100, 'Debe contener menos de 100 caracteres'),
  last_name: string()
    .required('El nombre es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(100, 'Debe contener menos de 100 caracteres'),
  phone: string()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El teléfono es obligatorio')
    .matches(/^[0-9]+$/, 'El teléfono solo debe contener números')
    .length(9, 'El teléfono debe tener exactamente 9 dígitos'),
  document_type: string()
    .required('El tipo de documento es obligatorio')
    .oneOf(['DNI', 'CE'], 'Tipo de documento no válido'),
  document_number: string()
    .required('El número de documento es obligatorio')
    .matches(/^[0-9]+$/, 'El número de documento solo debe contener números')
    .when('document_type', {
      is: 'DNI',
      then: (schema) => schema.length(8, 'El DNI debe tener exactamente 8 dígitos'),
      otherwise: (schema) =>
        schema.length(12, 'El carnet de extranjería debe tener exactamente 12 dígitos'),
    }),
})
