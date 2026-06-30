<script setup lang="ts">
import type { ChatMessage } from '@/stores/useChatStore'

interface Props {
  message: ChatMessage
}

defineProps<Props>()

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<template>
  <div
    class="flex mb-4 animate-fadeIn"
    :class="message.type === 'user' ? 'justify-end' : 'justify-start'"
  >
    <!-- Avatar IA -->
    <div v-if="message.type === 'ai'" class="shrink-0 mr-4">
      <div
        class="w-8 h-8 rounded-full bg-lienar-to-br from-blue-500 to-purple-500 flex items-center justify-center"
      >
        <font-awesome-icon icon="fa-brands fa-bilibili" size="2xl" class="text-dark" />
      </div>
    </div>

    <!-- Mensaje -->
    <div
      class="max-w-[75%] rounded-2xl px-4 py-3 shadow-md"
      :class="
        message.type === 'user'
          ? 'bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
          : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
      "
    >
      <!-- Contenido del mensaje -->
      <p class="text-sm leading-relaxed whitespace-pre-wrap">
        {{ message.content?.replace(/\$(\d+(\.\d+)?)/g, 'S/. $1') }}
      </p>

      <!-- Timestamp -->
      <p
        class="text-xs mt-2 opacity-70"
        :class="message.type === 'user' ? 'text-blue-100' : 'text-gray-500'"
      >
        {{ formatTime(message.timestamp) }}
      </p>
    </div>

    <!-- Avatar Usuario -->
    <div v-if="message.type === 'user'" class="shrink-0 ml-3">
      <div class="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
        <font-awesome-icon icon="fa-solid fa-user" size="2xl" class="text-white text-2xl" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
