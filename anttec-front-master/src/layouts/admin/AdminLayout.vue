<script setup lang="ts">
import AdminAsideHeader from '@/layouts/admin/components/AdminAsideHeader.vue'
import AdminBreadcrumb from '@/layouts/admin/components/AdminBreadcrumb.vue'
import AdminHeader from '@/layouts/admin/components/AdminHeader.vue'
import { useBreadcrumbStore } from '@/stores/useBreadcrumbStore'

const breadcrumbStore = useBreadcrumbStore()
</script>

<template>
  <AdminHeader />
  <AdminAsideHeader />
  <div class="p-4 sm:ml-64">
    <div class="mt-15">
      <AdminBreadcrumb :breadcrumbs="breadcrumbStore.items" />
      <div class="mt-3 p-3 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
