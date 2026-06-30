import { array, number, object } from 'yup'

export const createOptionProductSchema = object({
  option_id: number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('La opción es obligatoria'),

  values: array()
    .of(
      object({
        option_value_id: number()
          .nullable()
          .transform((value, originalValue) => (originalValue === '' ? null : value))
          .required('El valor es obligatorio'),
      }),
    )
    .required('Debe seleccionar al menos un valor')
    .min(1, 'Debe seleccionar al menos un valor')
    .test('unique-option-values-ids', 'No se pueden repetir los valores', (values) => {
      if (!values) return true

      const ids = values.map((v) => v.option_value_id).filter((id) => id != null)
      return ids.length === new Set(ids).size
    }),
})
