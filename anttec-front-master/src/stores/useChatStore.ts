import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { chatRecommendI, productIAI } from '@/interfaces/Ia/ChatRecommendInterface'
import IaService from '@/services/ia/IaService'

const STOCK_FALLBACK_PATTERNS = [
  'no tenemos ese producto en stock',
  'no tenemos ese producto',
  'no contamos con ese producto',
  'no hay stock',
  'sin stock',
]

const INFO_KEYWORDS = [
  'diferencia',
  'diferencias',
  'comparar',
  'comparacion',
  'comparación',
  'que es',
  'qué es',
  'explica',
  'como funciona',
  'cómo funciona',
  'para que sirve',
  'para qué sirve',
]

const PURCHASE_KEYWORDS = [
  'precio',
  'costo',
  'stock',
  'disponible',
  'comprar',
  'carrito',
  'envio',
  'envío',
  'garantia',
  'garantía',
]

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function isStockFallbackMessage(message: string): boolean {
  const normalized = normalizeText(message)
  return STOCK_FALLBACK_PATTERNS.some((pattern) => normalized.includes(pattern))
}

function isInformationalQuestion(query: string): boolean {
  const normalized = normalizeText(query)
  const hasInfoIntent = INFO_KEYWORDS.some((keyword) => normalized.includes(keyword))
  const hasPurchaseIntent = PURCHASE_KEYWORDS.some((keyword) => normalized.includes(keyword))

  return hasInfoIntent && !hasPurchaseIntent
}

function buildEducationalFallback(query: string): string | null {
  const normalized = normalizeText(query)
  const asksAboutRamAndSsd = normalized.includes('ram') && normalized.includes('ssd')

  if (asksAboutRamAndSsd) {
    return [
      'Claro. Te explico la diferencia entre RAM y SSD:',
      '',
      '1) RAM: memoria temporal y muy rapida. Se usa mientras programas y juegos estan abiertos.',
      '2) SSD: almacenamiento permanente. Guarda sistema, apps y archivos incluso cuando apagas la PC.',
      '3) Velocidad: la RAM es mas rapida para trabajo instantaneo; el SSD mejora carga de sistema y aplicaciones.',
      '4) Capacidad tipica: RAM en GB (8, 16, 32), SSD en GB/TB (256, 512, 1TB+).',
      '',
      'Si quieres, tambien te recomiendo una combinacion segun tu uso (oficina, gaming, edicion o estudio).',
    ].join('\n')
  }

  if (isInformationalQuestion(query)) {
    return [
      'Puedo ayudarte con preguntas tecnicas y comparaciones de componentes.',
      'Tambien puedo recomendarte productos segun tu presupuesto y uso.',
      'Si quieres, dime para que usaras el equipo y te sugiero opciones concretas.',
    ].join(' ')
  }

  return null
}

function resolveAiMessage(query: string, response: chatRecommendI): string {
  const hasProducts = Boolean(response.products && response.products.length > 0)
  if (hasProducts) return response.message

  if (!isStockFallbackMessage(response.message)) return response.message

  return buildEducationalFallback(query) ?? response.message
}

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

      const aiContent = resolveAiMessage(query.trim(), response)

      // Agregar respuesta de la IA
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: aiContent,
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
