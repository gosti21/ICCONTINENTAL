import type { adminBreadcrumbInterface } from '@/layouts/admin/interface/adminBreadcrumbInterface'
import { useBreadcrumbStore } from '@/stores/useBreadcrumbStore'
import { onBeforeUnmount, onMounted, watchEffect } from 'vue'

export function useBreadcrumb(
  breadcrumbs: adminBreadcrumbInterface[] | (() => adminBreadcrumbInterface[]),
) {
  const breadcrumbStore = useBreadcrumbStore()

  const updateBreadcrumbs = () => {
    const items = typeof breadcrumbs === 'function' ? breadcrumbs() : breadcrumbs
    breadcrumbStore.setBreadcrumb(items)
  }

  onMounted(updateBreadcrumbs)

  watchEffect(() => {
    updateBreadcrumbs()
  })

  onBeforeUnmount(() => {
    breadcrumbStore.setBreadcrumb([])
  })
}
