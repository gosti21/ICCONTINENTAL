import { object, string } from 'yup'

export const loginSchema = object({
  email: string().email('No es un email válido').required('El email es obligatorio'),
  password: string()
    .min(8, 'Debe de contener más de 8 caracteres')
    .required('La contraseña es obligatoria'),
})
