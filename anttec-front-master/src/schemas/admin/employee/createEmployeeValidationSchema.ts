import { number, object, string } from 'yup'

export const createEmployeeSchema = object({
  name: string()
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: 'El nombre solo puede contener letras y espacios',
      excludeEmptyString: true,
    })
    .required('El nombre es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(80, 'Debe contener menos de 50 caracteres'),
  last_name: string()
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: 'El apellido solo puede contener letras y espacios',
      excludeEmptyString: true,
    })
    .required('El apellido es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(80, 'Debe contener menos de 65 caracteres'),
  email: string().email('No es un email válido').required('El email es obligatorio'),
  password: string()
    .min(8, 'Debe de contener más de 8 caracteres')
    .required('La contraseña es obligatoria'),
  salary: number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El salario es obligatorio')
    .moreThan(0, 'El precio de compra debe ser mayor a 0')
    .test('decimal-2', 'El salario debe tener máximo 2 decimales', (value) => {
      if (value === undefined) return true
      return /^\d+(\.\d{1,2})?$/.test(value.toString())
    }),
  position: string()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('La posición es obligatorio')
    .oneOf(['seller', 'cashier', 'support', 'other'], 'Tipo de documento no válido'),
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
