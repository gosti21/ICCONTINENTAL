<script setup lang="ts">
import { useChatStore } from '@/stores/useChatStore'
import { nextTick, ref, watch } from 'vue'
import ChatMessage from './ChatMessage.vue'
import ChatProductCard from './ChatProductCard.vue'
import { useSweetAlert } from '@/composables/useSweetAlert'

const chatStore = useChatStore()
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

async function handleSend() {
  if (!inputMessage.value.trim()) return

  const message = inputMessage.value
  inputMessage.value = ''

  await chatStore.sendMessage(message)

  // Scroll al final después de agregar mensaje
  nextTick(() => {
    scrollToBottom()
  })
}

async function handleReset() {
  // Confirmación con SweetAlert
  const result = await useSweetAlert({
    title: '¿Nueva conversación?',
    text: 'Se perderá el historial actual. ¿Deseas continuar?',
    icon: 'warning',
    timer: 0,
    timerProgressBar: false,
    showCancelButton: true,
    confirmButtonText: 'Sí, reiniciar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280'
  })

  if (result?.isConfirmed) {
    chatStore.resetConversation()
    chatStore.initChat()

    // Notificación de éxito
    useSweetAlert({
      title: 'Conversación reiniciada',
      text: 'Puedes empezar una nueva consulta',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Auto-scroll cuando llegan nuevos mensajes
watch(
  () => chatStore.messages.length,
  () => {
    nextTick(() => {
      scrollToBottom()
    })
  },
)
</script>

<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div
      v-if="chatStore.isOpen"
      class="fixed inset-0 backdrop-blur-sm z-40"
      @click="chatStore.closeChat"
    ></div>
  </Transition>

  <!-- Chat Window -->
  <Transition name="slide">
    <div
      v-if="chatStore.isOpen"
      class="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-100 h-120 sm:h-160] bg-white sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div
        class="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-4 flex items-center justify-between"
      >
        <div class="flex items-center">
          <div
            class="w-10 h-10 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center mr-3"
          >
            <font-awesome-icon icon="fa-brands fa-bilibili" size="xl" class="text-dark" />
          </div>
          <div>
            <h3 class="font-semibold text-lg">Asistente IA</h3>
            <p class="text-xs text-white text-opacity-90">Siempre disponible para ayudarte</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Botón nueva conversación -->
          <button
            @click="handleReset"
            class="w-9 h-9 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center cursor-pointer"
            title="Nueva conversación"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-rotate-left" size="xl" class="text-dark" />
          </button>

          <!-- Botón cerrar -->
          <button
            @click="chatStore.closeChat"
            class="w-9 h-9 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center cursor-pointer"
            title="Cerrar chat"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" size="xl" class="text-red-500" />
          </button>
        </div>
      </div>

      <!-- Mensajes -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
        <!-- Lista de mensajes -->
        <div v-for="message in chatStore.messages" :key="message.id">
          <!-- Mensaje de texto -->
          <ChatMessage :message="message" />

          <!-- Productos (si los hay) -->
          <div v-if="message.products && message.products.length > 0" class="mb-4 space-y-3">
            <ChatProductCard
              v-for="product in message.products"
              :key="product.id"
              :product="product"
            />
          </div>
        </div>

        <!-- Indicador "escribiendo..." -->
        <div v-if="chatStore.isLoading" class="flex items-center mb-4 animate-fadeIn">
          <div class="shrink-0 mr-3">
            <div
              class="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center"
            >
              <i class="fas fa-robot text-white text-sm"></i>
            </div>
          </div>
          <div class="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-200">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style="animation-delay: 0.2s"
              ></div>
              <div
                class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style="animation-delay: 0.4s"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="border-t border-gray-200 p-4 bg-white">
        <form @submit.prevent="handleSend" class="flex items-center gap-2">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="Escribe tu mensaje..."
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            :disabled="chatStore.isLoading"
          />
          <button
            type="submit"
            :disabled="!inputMessage.trim() || chatStore.isLoading"
            class="w-12 h-12 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-paper-plane" size="xl" class="text-white" />
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-leave-active {
  transition: all 0.2s ease-in;
}

.slide-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Animaciones */
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

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

/* Scrollbar personalizado */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
