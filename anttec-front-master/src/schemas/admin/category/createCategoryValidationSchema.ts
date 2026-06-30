import { object, string } from 'yup'

export const createCategorySchema = object({
  name: string()
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: 'El nombre solo puede contener letras y espacios',
      excludeEmptyString: true,
    })
    .required('El nombre es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(80, 'Debe contener menos de 80 caracteres'),
})
