<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useChatStore } from '@/stores/useChatStore'
import ChatMessage from './ChatMessage.vue'
import ChatProductCard from './ChatProductCard.vue'

const chatStore = useChatStore()
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const suggestions = [
  '¿Qué perno necesito para maquinaria pesada?',
  'Diferencia entre grado 8.8 y 10.9',
  'Busco una tuerca para uso automotriz',
]

async function send(message = inputMessage.value) {
  const cleanMessage = message.trim()
  if (!cleanMessage) return
  inputMessage.value = ''
  await chatStore.sendMessage(cleanMessage)
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => [chatStore.messages.length, chatStore.isLoading], scrollToBottom)
</script>

<template>
  <Transition name="chat-fade">
    <button
      v-if="chatStore.isOpen"
      class="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-[2px]"
      aria-label="Cerrar asistente"
      @click="chatStore.closeChat"
    />
  </Transition>

  <Transition name="chat-slide">
    <section
      v-if="chatStore.isOpen"
      class="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden bg-white shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[680px] sm:max-h-[calc(100vh-3rem)] sm:w-[420px] sm:rounded-3xl"
      role="dialog"
      aria-modal="true"
      aria-label="Asesor técnico de El Mundo del Perno"
    >
      <header class="flex items-center justify-between bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-4 text-white">
        <div class="flex min-w-0 items-center gap-3">
          <div class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30">
            <font-awesome-icon icon="fa-solid fa-screwdriver-wrench" class="text-xl" />
          </div>
          <div class="min-w-0">
            <h2 class="truncate font-bold">Asesor técnico</h2>
            <p class="flex items-center gap-1.5 text-xs text-orange-50">
              <span class="h-2 w-2 rounded-full bg-emerald-300" />
              Pernos, automotriz y maquinaria pesada
            </p>
          </div>
        </div>
        <div class="flex gap-1">
          <button class="chat-icon-button" title="Nueva conversación" @click="chatStore.resetConversation">
            <font-awesome-icon icon="fa-solid fa-arrow-rotate-left" />
          </button>
          <button class="chat-icon-button" title="Cerrar" @click="chatStore.closeChat">
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>
      </header>

      <div ref="messagesContainer" class="flex-1 overflow-y-auto bg-orange-50/40 px-4 py-5">
        <ChatMessage v-for="message in chatStore.messages" :key="message.id" :message="message" />

        <div v-if="chatStore.messages.length === 1" class="mb-5 flex flex-wrap gap-2 pl-11">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="rounded-full border border-orange-200 bg-white px-3 py-2 text-left text-xs font-medium text-orange-800 transition hover:border-orange-400 hover:bg-orange-50"
            @click="send(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>

        <template v-for="message in chatStore.messages" :key="`${message.id}-products`">
          <div v-if="message.products?.length" class="mb-5 space-y-3 pl-11">
            <ChatProductCard v-for="product in message.products" :key="product.id" :product="product" />
          </div>
        </template>

        <div v-if="chatStore.isLoading" class="mb-4 flex items-center gap-3 pl-1" aria-live="polite">
          <div class="grid h-8 w-8 place-items-center rounded-xl bg-orange-100 text-orange-700">
            <font-awesome-icon icon="fa-solid fa-screwdriver-wrench" />
          </div>
          <div class="flex gap-1 rounded-2xl border border-orange-100 bg-white px-4 py-3 shadow-sm">
            <span v-for="dot in 3" :key="dot" class="typing-dot h-2 w-2 rounded-full bg-orange-400" :style="{ animationDelay: `${dot * 120}ms` }" />
          </div>
        </div>
      </div>

      <footer class="border-t border-orange-100 bg-white p-4">
        <form class="flex items-end gap-2" @submit.prevent="send()">
          <label class="sr-only" for="technical-chat-input">Escribe tu consulta técnica</label>
          <textarea
            id="technical-chat-input"
            v-model="inputMessage"
            rows="1"
            maxlength="500"
            placeholder="Ej.: necesito pernos M16 para una excavadora..."
            class="max-h-28 min-h-12 flex-1 resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            :disabled="chatStore.isLoading"
            @keydown.enter.exact.prevent="send()"
          />
          <button
            type="submit"
            class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!inputMessage.trim() || chatStore.isLoading"
            aria-label="Enviar mensaje"
          >
            <font-awesome-icon icon="fa-solid fa-paper-plane" />
          </button>
        </form>
        <p class="mt-2 text-center text-[11px] text-slate-400">Verifica medidas, norma y torque con un técnico antes de instalar.</p>
      </footer>
    </section>
  </Transition>
</template>

<style scoped>
.chat-icon-button {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  color: white;
  border-radius: 0.75rem;
  transition: background-color 0.2s ease;
}
.chat-icon-button:hover { background: rgb(255 255 255 / 20%); }
.chat-fade-enter-active, .chat-fade-leave-active { transition: opacity .2s ease; }
.chat-fade-enter-from, .chat-fade-leave-to { opacity: 0; }
.chat-slide-enter-active, .chat-slide-leave-active { transition: transform .25s ease, opacity .2s ease; }
.chat-slide-enter-from, .chat-slide-leave-to { transform: translateY(24px); opacity: 0; }
.typing-dot { animation: typing 1s ease-in-out infinite; }
@keyframes typing { 0%, 100% { transform: translateY(0); opacity: .35; } 50% { transform: translateY(-4px); opacity: 1; } }
</style>
