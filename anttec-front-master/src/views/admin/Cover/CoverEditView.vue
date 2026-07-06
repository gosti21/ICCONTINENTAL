<script setup lang="ts">
import ButtonSave from '@/components/Admin/ButtonSave.vue'
import AnimationLoader from '@/components/AnimationLoader.vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { useSweetAlert } from '@/composables/useSweetAlert'
import type { coverI } from '@/interfaces/admin/CoverInterface'
import { editCoverSchema } from '@/schemas/admin/cover/editCoverValidationSchema'
import CoverService from '@/services/admin/CoverService'
import axios from 'axios'
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
import { Datepicker } from 'flowbite'
import Swal from 'sweetalert2'
import { useField, useForm } from 'vee-validate'
import { nextTick, onMounted, ref, watch } from 'vue'
import VueFilePond from 'vue-filepond'
import { useRoute } from 'vue-router'

const coverService = new CoverService()

type DatepickerChangeEvent = CustomEvent<{
  date: Date | null
}>

const route = useRoute()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const isLoading = ref(true)
const cover = ref<coverI | null>(null)
const serverErrors = ref<Record<string, string[]>>({})
const filePondRef = ref<FilePondInstance | null>(null)
const initialFiles = ref<Array<Record<string, unknown>>>([])
const pondReady = ref(false)

useBreadcrumb(() => [
  { name: 'Dashboard', route: 'admin.dashboard' },
  { name: 'Portadas', route: 'admin.covers' },
  {
    name: cover.value ? `Editar - ${cover.value.title}` : 'Editar',
  },
])

const { meta, handleSubmit, errors, defineField, resetForm, setFieldValue, setErrors } =
  useForm({
    validationSchema: editCoverSchema,
  })

const [title, titleAttrs] = defineField('title')
const [startAt] = defineField('start_at')
const [endAt] = defineField('end_at')

const startDatepickerEl = ref<HTMLInputElement | null>(null)
const endDatepickerEl = ref<HTMLInputElement | null>(null)

const {
  errorMessage: imagesError,
  meta: imagesMeta,
  setTouched: setImagesTouched,
} = useField<Blob | null>('image')

const FilePond = VueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginImageExifOrientation,
  FilePondPluginFileValidateSize,
  FilePondPluginFileValidateType,
  FilePondPluginImageResize,
  FilePondPluginFilePoster,
)

const onUpdateFiles = (files: FilePondFile[]) => {
  if (!imagesMeta.touched) {
    setImagesTouched(true)
  }

  if (!files.length) {
    setFieldValue('image', '')
    return
  }

  const fileItem = files[0]

  // 🟢 imagen nueva (File o Blob)
  if (fileItem.file) {
    setFieldValue('image', files.length ? files[0].file : '') // 👈 Blob | File
  }
}

const loadcovers = async () => {
  try {
    cover.value = await coverService.getById(id)
    resetForm({
      values: {
        title: cover.value.title,
        start_at: cover.value.start_at,
        end_at: cover.value.end_at,
        image: cover.value.image,
      },
    })
    /* 🔹 Imagen existente en FilePond usando File Poster */
    if (cover.value.image) {
      const imageName = cover.value.image.split('/').pop() || 'imagen.jpg'

      initialFiles.value = [
        {
          source: cover.value.image,
          options: {
            type: 'local',
            file: {
              name: imageName,
              size: 0,
              type: 'image/jpeg',
            },
            metadata: {
              poster: cover.value.image,
            },
          },
        },
      ]
    }
    pondReady.value = true
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const initDatepickers = async () => {
  await nextTick()

  if (startDatepickerEl.value) {
    const startPicker = new Datepicker(startDatepickerEl.value, {
      format: 'yyyy-mm-dd',
      autohide: true,
    })

    if (cover.value?.start_at) {
      startPicker.setDate(new Date(cover.value.start_at))
    }

    startDatepickerEl.value.addEventListener('changeDate', (e: Event) => {
      const event = e as DatepickerChangeEvent

      startAt.value = event.detail.date ? event.detail.date.toISOString().split('T')[0] : ''
    })
  }

  if (endDatepickerEl.value) {
    const endPicker = new Datepicker(endDatepickerEl.value, {
      format: 'yyyy-mm-dd',
      autohide: true,
    })

    if (cover.value?.end_at) {
      endPicker.setDate(new Date(cover.value.end_at))
    }

    endDatepickerEl.value.addEventListener('changeDate', (e: Event) => {
      const event = e as DatepickerChangeEvent

      endAt.value = event.detail.date ? event.detail.date.toISOString().split('T')[0] : ''
    })
  }
}

onMounted(() => {
  loadcovers()
})

watch(isLoading, (val) => {
  if (!val) initDatepickers()
})

const onSubmit = handleSubmit(async (values) => {
  try {
    useSweetAlert({
      title: 'Enviando...',
      text: 'Procesando el formulario',
      icon: 'loading',
    })
    const formData = new FormData()

    formData.append('title', String(values.title))
    formData.append('start_at', String(values.start_at))
    if (values.end_at) {
      formData.append('end_at', values.end_at)
    }
    if (values.image instanceof File) {
      formData.append('image', values.image)
    }

    await coverService.update(formData, id)

    useSweetAlert({
      title: 'Portada actualizada',
      text: 'La portada ha sido actualizada con éxito',
      icon: 'success',
    })
  } catch (err) {
    if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
      useSweetAlert({
        title: 'Tiempo de espera agotado',
        text: 'Render tardó demasiado en responder. Intenta nuevamente en unos segundos.',
        icon: 'error',
        timer: 0,
      })
      return
    }

    if (axios.isAxiosError(err) && err.response?.status === 422) {
      const validationErrors = err.response.data.errors
      serverErrors.value = validationErrors
      const veeValidateErrors: Record<string, string> = {}
      Object.keys(validationErrors).forEach((field) => {
        veeValidateErrors[field] = validationErrors[field][0]
      })
      setErrors(veeValidateErrors)
    }
    useSweetAlert({
      title: 'Algo salió mal',
      text: 'Verifica los datos e intenta de nuevo',
      icon: 'error',
      timer: 0,
    })
  } finally {
    Swal.close()
  }
})
</script>

<template>
  <AnimationLoader v-if="isLoading" />
  <div
    v-else
    class="block p-5 border rounded-lg shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
  >
    <form action="" method="POST" @submit.prevent="onSubmit">
      <div class="mb-4">
        <label for="title" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Título
        </label>
        <input
          v-model="title"
          v-bind="titleAttrs"
          id="title"
          type="text"
          class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1"
          placeholder="Ingrese el título"
        />
        <span class="text-red-400">{{ errors.title }}</span>
      </div>
      <div class="mb-4">
        <label for="start_at" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Fecha de inicio
        </label>
        <div class="relative w-full">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <font-awesome-icon icon="fa-solid fa-calendar" size="lg" class="dark:text-gray-200" />
          </div>
          <input
            id="start_at"
            ref="startDatepickerEl"
            type="text"
            autocomplete="off"
            class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1 ps-12 p-2.5"
            placeholder="Ingrese una fecha"
          />
        </div>
        <span class="text-red-400">{{ errors.start_at }}</span>
      </div>
      <div class="mb-4">
        <label for="end_at" class="block mb-2 font-medium text-gray-900 dark:text-gray-200">
          Fecha de Fin (Opcional)
        </label>
        <div class="relative w-full">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <font-awesome-icon icon="fa-solid fa-calendar" size="lg" class="dark:text-gray-200" />
          </div>
          <input
            id="end_at"
            ref="endDatepickerEl"
            type="text"
            autocomplete="off"
            class="mb-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:text-gray-200 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 focus:outline-none focus:ring-1 ps-12 p-2.5"
            placeholder="Ingrese una fecha"
          />
        </div>
        <span class="text-red-400">{{ errors.end_at }}</span>
      </div>
      <div class="mb-6">
        <label class="block mb-3 font-medium text-gray-900 dark:text-gray-200">
          Imagen de la portada
        </label>

        <div class="w-full max-w-4xl mx-auto">
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
            maxFileSize="15MB"
            imagePreviewHeight="290"
            @updatefiles="onUpdateFiles"
            labelIdle="Arrastra la imagen o <span class='filepond--label-action'>Examinar</span>"
          />
        </div>
        <span class="text-red-400" v-if="imagesMeta.touched">{{ imagesError }}</span>
      </div>
      <div class="flex justify-end mt-4">
        <ButtonSave name="Actualizar" :disabled="!meta.valid" />
      </div>
    </form>
  </div>
</template>

<style scoped>
:deep(.filepond--list) {
  display: flex;
}

:deep(.filepond--item) {
  width: 100%;
  aspect-ratio: 3 / 1;
  border-radius: 14px;
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
