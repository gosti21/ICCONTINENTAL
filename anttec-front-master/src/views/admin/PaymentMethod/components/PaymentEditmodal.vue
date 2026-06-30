<script setup lang="ts">
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { paymentMethodI } from '@/interfaces/admin/PaymentMethodInterface'
import PaymentMethodService from '@/services/admin/PaymentMethodService'
import { Modal, type ModalInterface } from 'flowbite'
import Swal from 'sweetalert2'
import type { FilePondFile, FilePond as FilePondInstance } from 'filepond'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import FilePondPluginImageResize from 'filepond-plugin-image-resize'
import FilePondPluginFilePoster from 'filepond-plugin-file-poster'
import 'filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css'
import 'filepond/dist/filepond.min.css'
import VueFilePond from 'vue-filepond'
import { useField, useForm } from 'vee-validate'
import { onMounted, onUnmounted, ref } from 'vue'
import { editPaymentMethodSchema } from '@/schemas/admin/editPaymentMethodValidationSchema'

// ─── Emits ───────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  (e: 'updated', updatedItem: paymentMethodI): void
}>()

// ─── Servicios ───────────────────────────────────────────────────────────────
const paymentMethodService = new PaymentMethodService()

// ─── FilePond setup ──────────────────────────────────────────────────────────
const FilePond = VueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginImageExifOrientation,
  FilePondPluginFileValidateSize,
  FilePondPluginFileValidateType,
  FilePondPluginImageResize,
  FilePondPluginFilePoster,
)

// ─── Modal (Flowbite) ────────────────────────────────────────────────────────
const modalEl = ref<HTMLElement | null>(null)
let modal: ModalInterface | null = null

onMounted(() => {
  if (!modalEl.value) return
  modal = new Modal(modalEl.value, {
    placement: 'center',
    backdrop: 'dynamic',
    closable: true,
  })
})

onUnmounted(() => {
  modal?.hide()
  modal = null
})

// ─── vee-validate con el schema ──────────────────────────────────────────────
const { meta, setFieldValue, resetForm } = useForm({
  validationSchema: editPaymentMethodSchema,
})

const {
  errorMessage: imageError,
  meta: imageMeta,
  setTouched: setImageTouched,
} = useField<File | Blob | string>('image')

// ─── Estado interno ──────────────────────────────────────────────────────────
const isLoading = ref(false)
const currentId = ref<string | null>(null)
const name = ref('')
const type = ref('')
const initialFiles = ref<Array<Record<string, unknown>>>([])
const pondReady = ref(false)
const filePondRef = ref<FilePondInstance | null>(null)

// ─── Métodos expuestos al padre ──────────────────────────────────────────────
const open = async (id: number | string) => {
  currentId.value = String(id)

  // Reset completo antes de cada apertura
  pondReady.value = false
  initialFiles.value = []
  name.value = ''
  type.value = ''
  resetForm()

  modal?.show()
  await fetchData()
}

const close = () => {
  modal?.hide()
}

// ─── Carga datos del item ────────────────────────────────────────────────────
const fetchData = async () => {
  if (!currentId.value) return
  isLoading.value = true

  try {
    const item = await paymentMethodService.getById(currentId.value)

    name.value = item.name
    type.value = item.type

    // Setear imagen en vee-validate: string URL existente → válido según schema
    if (item.image) {
      setFieldValue('image', item.image)

      // Poster para FilePond (exacto como en Cover edit)
      const imageName = item.image.split('/').pop() || 'imagen.jpg'
      initialFiles.value = [
        {
          source: item.image,
          options: {
            type: 'local',
            file: {
              name: imageName,
              size: 0,
              type: 'image/jpeg',
            },
            metadata: {
              poster: item.image,
            },
          },
        },
      ]
    }

    // Monta FilePond solo cuando los datos están listos
    pondReady.value = true
  } catch (err) {
    useSweetAlert({ title: 'Algo salió mal', text: 'No se pudieron cargar los datos', icon: 'error', timer: 0 })
    console.error(err)
    close()
  } finally {
    isLoading.value = false
  }
}

// ─── FilePond callbacks (exacto como en Cover edit) ─────────────────────────
const onUpdateFiles = (files: FilePondFile[]) => {
  // Marca touched al primer cambio → muestra error si la elimina
  if (!imageMeta.touched) {
    setImageTouched(true)
  }

  // Usuario eliminó la imagen → '' no pasa required → inválido → botón disabled
  if (!files.length) {
    setFieldValue('image', '')
    return
  }

  const fileItem = files[0]

  // File nuevo subido por el usuario
  if (fileItem.file) {
    setFieldValue('image', fileItem.file)
  }
}

// ─── Submit ──────────────────────────────────────────────────────────────────
const onSubmit = async () => {
  if (!currentId.value) return

  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Actualizando método de pago',
      icon: 'loading',
    })

    const formData = new FormData()
    formData.append('name', name.value)
    formData.append('type', type.value)

    // Solo adjunta imagen si es un File nuevo (no la URL string existente)
    const currentFiles = filePondRef.value?.getFiles()
    if (currentFiles?.length && currentFiles[0].file instanceof File) {
      formData.append('image', currentFiles[0].file)
    }

    const updated = await paymentMethodService.update(formData, currentId.value)

    Swal.close()
    useSweetAlert({
      title: '¡Actualizado!',
      text: 'El método de pago se actualizó correctamente',
      icon: 'success',
    })

    emit('updated', updated)
    close()
  } catch (err) {
    Swal.close()
    useSweetAlert({
      title: 'Algo salió mal',
      text: 'Verifica los datos e intenta de nuevo',
      icon: 'error',
      timer: 0,
    })
    console.error(err)
  }
}

// ─── Expose ──────────────────────────────────────────────────────────────────
defineExpose({ open, close })
</script>

<template>
  <div
    ref="modalEl"
    tabindex="-1"
    aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative p-4 w-full max-w-lg max-h-full">
      <div class="relative bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">

        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Editar método de pago
          </h3>
          <button
            @click="close"
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-5">

          <!-- Skeleton mientras carga -->
          <div v-if="isLoading" class="space-y-4">
            <div>
              <div class="h-4 w-28 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
              <div class="h-40 w-full bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
            </div>
          </div>

          <!-- Formulario real -->
          <div v-else class="space-y-4">

            <!-- Campo: Imagen con FilePond + error de validación -->
            <div>
              <label class="block mb-2 font-medium text-gray-900 dark:text-gray-200">Imagen</label>
              <FilePond
                v-if="pondReady"
                ref="filePondRef"
                name="image"
                :files="initialFiles"
                allowFileTypeValidation="true"
                allowImageResize="true"
                imageResizeUpscale="true"
                imageResizeMode="cover"
                :acceptedFileTypes="['image/*']"
                allowImagePreview="true"
                maxFileSize="5MB"
                imagePreviewHeight="180"
                @updatefiles="onUpdateFiles"
                labelIdle="Arrastra la imagen o <span class='filepond--label-action'>Examinar</span>"
              />
              <!-- Error solo aparece cuando ya tocó el campo y hay error -->
              <span class="text-red-400 text-sm" v-if="imageMeta.touched && imageError">
                {{ imageError }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer: botón disabled cuando carga O cuando el schema no es válido -->
        <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-600">
          <button
            @click="close"
            type="button"
            class="text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="onSubmit"
            :disabled="isLoading || !meta.valid"
            type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.filepond--list) {
  display: flex;
}
:deep(.filepond--item) {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
}
:deep(.filepond--image-preview-wrapper),
:deep(.filepond--image-preview),
:deep(.filepond--image-preview img),
:deep(.filepond--image-preview canvas) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
