import { number, object, string } from 'yup'

export const createSubcategorySchema = object({
  name: string()
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: 'El nombre solo puede contener letras y espacios',
      excludeEmptyString: true,
    })
    .required('El nombre es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(80, 'Debe contener menos de 80 caracteres'),
  category_id: number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('La categoría es obligatoria'),
})
