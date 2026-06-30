import { OPTION_TYPE_VALUES } from '@/config/const/optionType'
import { array, boolean, object, string } from 'yup'

export const editOptionSchema = object({
  name: string()
    .optional()
    .required('El nombre es obligatorio')
    .min(3, 'Debe contener al menos 3 caracteres')
    .max(80, 'Debe contener menos de 80 caracteres')
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),

  type: string()
    .oneOf(OPTION_TYPE_VALUES, 'Tipo inválido')
    .optional()
    .required('El tipo es obligatorio'),
  status: boolean().optional(),
  option_values: array()
    .of(
      object({
        value: string()
          .optional()
          .required('El valor es obligatorio')
          .min(1, 'Debe contener al menos 1 caracter')
          .max(20, 'Debe contener menos de 20 caracteres'),

        description: string()
          .optional()
          .required('La descripción es obligatoria')
          .min(1, 'Debe contener al menos 1 caracteres')
          .max(60, 'Debe contener menos de 60 caracteres'),
      }),
    )
    .optional()
    .required('Debes agregar al menos un valor de opción')
    .min(1, 'Debes agregar al menos un valor de opción')
    .test('unique-option-values', 'Los valores de opción no pueden repetirse', (values) => {
      if (!values) return false
      const vals = values.map((v) => (v.value ?? '').trim().toLowerCase())
      return vals.length === new Set(vals).size
    }),
})
