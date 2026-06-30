<script setup lang="ts">
import type { BreadcrumbInterface } from './interface/breadcrumbInterface'

defineProps<{
  breadcrumbs: BreadcrumbInterface[]
}>()
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse flex-wrap">
      <li class="inline-flex items-center">
        <router-link
          :to="{ name: 'shop.home' }"
          class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white"
        >
          <font-awesome-icon icon="fa-solid fa-house" size="sm" />
          <span class="mx-1"> Home </span>
        </router-link>
        <font-awesome-icon icon="fa-solid fa-angle-right" class="text-gray-400 mx-1" />
      </li>
      <li
        v-for="(item, index) in breadcrumbs"
        :key="item.name"
        class="flex items-center"
        v-bind="index === breadcrumbs.length - 1 ? { 'aria-current': 'page' } : {}"
      >
        <font-awesome-icon
          v-if="index != 0"
          icon="fa-solid fa-angle-right"
          class="text-gray-400 mx-1"
        />
        <router-link
          v-if="item.route"
          :to="{ name: item.route, params: item.params }"
          :class="[
            'text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white',
            index != 0 ? 'ms-1 md:ms-2' : '',
          ]"
        >
          {{ item.name }}
        </router-link>
        <span
          v-else
          :class="[
            'text-sm font-medium text-gray-500 dark:text-gray-400 pointer-events-none',
            index != 0 ? 'ms-1 md:ms-2' : '',
          ]"
        >
          {{ item.name }}
        </span>
      </li>
    </ol>
    >
  </nav>
</template>
