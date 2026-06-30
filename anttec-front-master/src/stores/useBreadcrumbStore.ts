import type { adminBreadcrumbInterface } from '@/layouts/admin/interface/adminBreadcrumbInterface'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBreadcrumbStore = defineStore('breadcrumb', () => {
  const items = ref<adminBreadcrumbInterface[]>([])

  function setBreadcrumb(newItems: adminBreadcrumbInterface[]) {
    items.value = newItems
  }

  return {
    items,
    setBreadcrumb,
  }
})
