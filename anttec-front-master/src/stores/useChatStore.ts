import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import IaService from '@/services/ia/IaService'
import type { chatRecommendI, productIAI } from '@/interfaces/Ia/ChatRecommendInterface'

export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  products?: productIAI[]
}

const WELCOME_MESSAGE =
  'Hola, soy el asesor técnico de EL MUNDO DEL PERNO. Puedo orientarte sobre pernos, tuercas, roscas, grados de resistencia, fijaciones automotrices y aplicaciones para maquinaria pesada. Cuéntame qué equipo tienes y qué pieza necesitas.'

export const useChatStore = defineStore('chat', () => {
  const isOpen = ref(false)
  const messages = ref<ChatMessage[]>([])
  const conversationId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const iaService = new IaService()

  const hasMessages = computed(() => messages.value.length > 0)
  const lastMessage = computed(() => messages.value[messages.value.length - 1])

  function initChat() {
    if (hasMessages.value) return
    messages.value.push(createMessage('ai', WELCOME_MESSAGE))
  }

  function openChat() {
    isOpen.value = true
    initChat()
  }

  function closeChat() {
    isOpen.value = false
  }

  function toggleChat() {
    isOpen.value ? closeChat() : openChat()
  }

  async function sendMessage(query: string) {
    const cleanQuery = query.trim()
    if (!cleanQuery || isLoading.value) return

    messages.value.push(createMessage('user', cleanQuery))
    isLoading.value = true
    error.value = null

    try {
      const response: chatRecommendI = await iaService.chatRecommend(
        cleanQuery,
        conversationId.value || undefined,
      )

      conversationId.value = response.conversation_id
      messages.value.push(
        createMessage(
          'ai',
          response.message || 'No pude generar una respuesta. Intenta reformular tu consulta.',
          response.products || undefined,
        ),
      )
    } catch (requestError) {
      console.error('Error en el asistente técnico:', requestError)
      error.value = 'No pudimos conectar con el asesor en este momento.'
      messages.value.push(
        createMessage(
          'ai',
          'Tuve un problema de conexión. Por favor, inténtalo nuevamente en unos segundos.',
        ),
      )
    } finally {
      isLoading.value = false
    }
  }

  function resetConversation() {
    messages.value = []
    conversationId.value = null
    error.value = null
    initChat()
  }

  return {
    isOpen,
    messages,
    conversationId,
    isLoading,
    error,
    hasMessages,
    lastMessage,
    initChat,
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
    resetConversation,
  }
})

function createMessage(type: ChatMessage['type'], content: string, products?: productIAI[]): ChatMessage {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    content,
    timestamp: new Date(),
    products,
  }
}
