import Swal, { type SweetAlertPosition } from 'sweetalert2'

type sweetAlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question'

interface sweetAlertToastI {
  title: string
  text?: string
  icon: sweetAlertIcon
  timer?: number
  timerProgressBar?: boolean
  toast?: boolean
  position: SweetAlertPosition
  showConfirmButton: boolean
}

export function useSweetAlertToast(options: sweetAlertToastI) {
  const {
    title,
    text,
    icon,
    timer = 1500,
    timerProgressBar = true,
    toast = true,
    position = 'top-end',
    showConfirmButton,
  } = options

  const Toast = Swal.mixin({
    toast,
    position,
    showConfirmButton,
    timer,
    timerProgressBar,
  })

  Toast.fire({
    title,
    icon,
    text,
  })
}
