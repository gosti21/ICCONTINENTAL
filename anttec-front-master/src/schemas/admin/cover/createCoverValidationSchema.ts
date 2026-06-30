import { date, mixed, object, ref, string } from 'yup'

export const createCoverSchema = object({
  title: string()
    .required('El título es obligatorio')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede superar los 100 caracteres'),

  start_at: date()
    .required('La fecha de inicio es obligatoria')
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      'La fecha de inicio no puede ser anterior a hoy',
    ),

  end_at: date()
    .notRequired()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(ref('start_at'), 'La fecha de fin debe ser igual o posterior a la fecha de inicio'),

  image: mixed<File>()
    .required('La imagen es obligatoria')
    .test('fileType', 'Debe ser una imagen', (file) =>
      file ? file.type.startsWith('image/') : false,
    ),
})
