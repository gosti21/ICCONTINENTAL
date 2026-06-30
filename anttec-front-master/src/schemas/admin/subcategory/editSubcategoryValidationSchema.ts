import { boolean, number, object, string } from 'yup'

export const editSubcategorySchema = object({
  name: string()
    .optional()
    .required('El nombre es obligatorio')
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: 'El nombre solo puede contener letras y espacios',
      excludeEmptyString: true,
    })
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(80, 'Debe contener menos de 80 caracteres'),
  category_id: number()
    .optional()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('La categoría es obligatoria'),
  status: boolean().optional(),
})
