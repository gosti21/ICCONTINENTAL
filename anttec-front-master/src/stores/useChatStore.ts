import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { chatRecommendI, productIAI } from '@/interfaces/Ia/ChatRecommendInterface'
import IaService from '@/services/ia/IaService'

export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  products?: productIAI[]
}

export const useChatStore = defineStore('chat', () => {
  // State
  const isOpen = ref(false)
  const messages = ref<ChatMessage[]>([])
  const conversationId = ref<string | null>(null)
  const isLoading = ref(false)
  const iaService = new IaService()

  // Computed
  const hasMessages = computed(() => messages.value.length > 0)
  const lastMessage = computed(() => messages.value[messages.value.length - 1])

  // Actions
  function toggleChat() {
    isOpen.value = !isOpen.value
  }

  function openChat() {
    isOpen.value = true
  }

  function closeChat() {
    isOpen.value = false
  }

  async function sendMessage(query: string) {
    if (!query.trim()) return

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: query.trim(),
      timestamp: new Date(),
    }
    messages.value.push(userMessage)

    // Mostrar indicador de carga
    isLoading.value = true

    try {
      // Llamar a la IA
      const response: chatRecommendI = await iaService.chatRecommend(
        query.trim(),
        conversationId.value || undefined,
      )

      // Guardar conversation_id
      conversationId.value = response.conversation_id

      // Agregar respuesta de la IA
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.message,
        timestamp: new Date(),
        products: response.products || undefined,
      }
      messages.value.push(aiMessage)
    } catch (error) {
      console.error('Error en chat:', error)

      // Mensaje de error
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      }
      messages.value.push(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  function resetConversation() {
    messages.value = []
    conversationId.value = null
    isLoading.value = false
  }

  function initChat() {
    // Mensaje de bienvenida
    if (messages.value.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content:
          '¡Hola! 👋 Soy tu asistente de compras con IA. ¿Qué periférico estás buscando hoy?',
        timestamp: new Date(),
      }
      messages.value.push(welcomeMessage)
    }
  }

  return {
    // State
    isOpen,
    messages,
    conversationId,
    isLoading,

    // Computed
    hasMessages,
    lastMessage,

    // Actions
    toggleChat,
    openChat,
    closeChat,
    sendMessage,
    resetConversation,
    initChat,
  }
})
