import { mixed, object } from 'yup'

export const editPaymentMethodSchema = object({
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
