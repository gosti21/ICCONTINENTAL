import { number, object } from 'yup'

export const addValuesSchema = object({
  option_value_id: number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El valor es obligatorio'),
})
