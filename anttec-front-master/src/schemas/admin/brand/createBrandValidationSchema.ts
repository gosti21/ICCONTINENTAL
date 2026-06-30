import { object, string } from 'yup'

export const createBrandSchema = object({
  name: string()
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s-]+$/, {
      message: 'El nombre solo puede contener letras y espacios',
      excludeEmptyString: true,
    })
    .required('El nombre es obligatorio')
    .min(2, 'Debe de contener más de 3 caracteres')
    .max(80, 'Debe contener menos de 60 caracteres'),
})
