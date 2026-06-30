<script setup lang="ts">
import ChatButton from '@/components/Ia/ChatButton.vue'
import ChatWindow from '@/components/Ia/ChatWindow.vue'
import { useCartStore } from '@/stores/useCartStore'
import { onMounted } from 'vue'
import BannerShort from './components/BannerShort.vue'
import FooterShop from './components/FooterShop.vue'
import HeaderShop from './components/HeaderShop.vue'

const cartStore = useCartStore()

onMounted(() => {
  cartStore.loadCart()
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <BannerShort />
    <HeaderShop />
    <main class="flex-1">
      <router-view></router-view>
    </main>
    <FooterShop />

    <!-- Chat IA -->
    <ChatButton />
    <!-- ← NUEVO -->
    <ChatWindow />
    <!-- ← NUEVO -->
  </div>
</template>
