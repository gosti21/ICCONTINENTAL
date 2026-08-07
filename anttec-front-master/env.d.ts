/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'swiper/css'
declare module 'swiper/css/free-mode'
declare module 'swiper/css/navigation'
declare module 'swiper/css/thumbs'
declare module 'swiper/css/pagination'
