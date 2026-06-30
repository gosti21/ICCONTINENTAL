import { boolean, number, object, string } from 'yup'

export const editDepartmentSchema = object({
  name: string()
    .optional()
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: 'El nombre solo puede contener letras y espacios',
      excludeEmptyString: true,
    })
    .required('El nombre es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(80, 'Debe contener menos de 80 caracteres'),
  country_id: number()
    .optional()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El país es obligatorio'),
  status: boolean().optional(),
})
