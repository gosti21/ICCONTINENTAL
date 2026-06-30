import { onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'

export function useClickOutside(
  elementRef: Ref<HTMLElement | null>,
  callback: () => void,
  isActive: Ref<boolean>,
) {
  const handleClick = (event: MouseEvent) => {
    if (elementRef.value && !elementRef.value.contains(event.target as Node)) {
      callback()
    }
  }

  const addEventListener = () => {
    document.addEventListener('click', handleClick)
  }

  const removeEventListener = () => {
    document.removeEventListener('click', handleClick)
  }

  watch(isActive, (value) => {
    if (value) addEventListener()
    else removeEventListener()
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClick)
  })
}
