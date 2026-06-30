import { boolean, object, string } from 'yup'

export const editCategorySchema = object({
  name: string()
    .optional()
    .required('El nombre es obligatorio')
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: 'El nombre solo puede contener letras y espacios',
      excludeEmptyString: true,
    })
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(80, 'Debe contener menos de 80 caracteres'),
  status: boolean().optional(),
})
