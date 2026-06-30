import { boolean, object, string } from 'yup'

export const editCourierSchema = object({
  name: string()
    .optional()
    .required('El nombre es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(80, 'Debe contener menos de 80 caracteres'),
  phone: string()
    .optional()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El teléfono es obligatorio')
    .matches(/^[0-9]+$/, 'El teléfono solo debe contener números')
    .length(9, 'El teléfono debe tener exactamente 9 dígitos'),
  email: string()
    .email('No es un email válido'),
  district: string()
    .optional()
    .required('El distrito es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(60, 'Debe contener menos de 60 caracteres'),
  street: string()
    .optional()
    .required('La calle es obligatoria')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(100, 'Debe contener menos de 60 caracteres'),
  reference: string()
    .optional()
    .required('La referencia es obligatoria')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(120, 'Debe contener menos de 120 caracteres'),
  status: boolean().optional(),
})
