import { boolean, number, object, string } from 'yup'

export const shipmentSchema = object({
  tracking_number: string()
    .required('El número de envío es obligatorio')
    .min(3, 'Debe de contener más de 2 caracteres')
    .max(15, 'Debe contener menos de 15 caracteres'),
  shipping_company_id: number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .required('El courier es obligatoria'),
  status: boolean().optional(),
})
