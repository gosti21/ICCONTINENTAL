import { object, string, ref } from 'yup'

export const registerSchema = object({
  name: string()
    .required('El nombre es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  last_name: string()
    .required('El apellido es obligatorio')
    .min(3, 'Debe de contener más de 3 caracteres')
    .max(65, 'El apellido no puede tener más de 65 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras'),
  email: string().email('No es un email válido').required('El email es obligatorio'),
  password: string()
    .min(8, 'Debe de contener más de 8 caracteres')
    .required('La contraseña es obligatoria'),
  password_confirmation: string()
    .required('Debes confirmar tu contraseña')
    .min(8, 'Debe de contener más de 8 caracteres')
    .oneOf([ref('password')], 'Las contraseñas no coinciden'),
})
