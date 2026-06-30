import { date, mixed, object, ref, string } from 'yup'

export const editCoverSchema = object({
  title: string()
    .optional()
    .required('El título es obligatorio')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede superar los 100 caracteres'),

  start_at: date()
    .optional()
    .required('La fecha de inicio es obligatoria')
    .transform((value, originalValue) => (originalValue === '' ? null : value)),

  end_at: date()
    .optional()
    .notRequired()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .min(ref('start_at'), 'La fecha de fin debe ser igual o posterior a la fecha de inicio'),

  image: mixed<File | Blob | string | { name: string; size: number; type: string }>()
    .required('La imagen es obligatoria')
    .test('imageType', 'Debe ser una imagen', (value) => {
      if (!value) return false

      // Imagen existente (URL string)
      if (typeof value === 'string') return true

      // Objeto de metadatos de FilePond (archivo existente con File Poster)
      if (
        typeof value === 'object' &&
        'name' in value &&
        'type' in value &&
        typeof value.type === 'string'
      ) {
        return value.type.startsWith('image/')
      }

      // File (nueva imagen subida)
      if (value instanceof File) {
        return value.type.startsWith('image/')
      }

      // Blob (FilePond resize / preview)
      if (value instanceof Blob) {
        return value.type.startsWith('image/')
      }

      return false
    }),
})
