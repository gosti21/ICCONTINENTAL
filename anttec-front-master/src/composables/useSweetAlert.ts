import Swal from 'sweetalert2'

type sweetAlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question'

interface sweetAlertI {
  title: string
  text: string
  icon?: sweetAlertIcon | 'loading'
  timer?: number
  timerProgressBar?: boolean
  showCancelButton?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonColor?: string
  cancelButtonColor?: string
  showConfirmButton?: boolean
  allowOutsideClick?: boolean
}

export function useSweetAlert(options: sweetAlertI) {
  const {
    title,
    text,
    icon,
    timer = 1500,
    timerProgressBar = true,
    showCancelButton,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor,
    showConfirmButton,
    allowOutsideClick,
  } = options

  if (icon == 'loading') {
    Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })
  } else {
    return Swal.fire({
      title,
      text,
      icon: icon as sweetAlertIcon,
      timer,
      timerProgressBar,
      ...(showCancelButton !== undefined && { showCancelButton }),
      ...(confirmButtonText && { confirmButtonText }),
      ...(cancelButtonText && { cancelButtonText }),
      ...(confirmButtonColor && { confirmButtonColor }),
      ...(cancelButtonColor && { cancelButtonColor }),
      ...(showConfirmButton !== undefined && { showConfirmButton }),
      ...(allowOutsideClick !== undefined && { allowOutsideClick })
    })

  }
}
