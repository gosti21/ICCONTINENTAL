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
  'por el momento no contamos con ese producto en nuestro catalogo',
  'por el momento no contamos con ese producto en nuestro catalgo',
  'no contamos con ese producto en nuestro catalogo',
  'no contamos con ese producto en nuestro catalgo',
  'no encontrado en catalogo',
  'no encontrado en catalgo',
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

const GREETING_KEYWORDS = ['hola', 'holi', 'buenas', 'buenos dias', 'buenas tardes', 'hello']
const HELP_KEYWORDS = ['ayuda', 'ayudame', 'qué puedes hacer', 'que puedes hacer']
const THANKS_KEYWORDS = ['gracias', 'muchas gracias', 'thanks']
const BYE_KEYWORDS = ['adios', 'hasta luego', 'nos vemos', 'bye']

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

function isNoProductsLikeMessage(message: string): boolean {
  const normalized = normalizeText(message)

  if (isStockFallbackMessage(message)) {
    return true
  }

  const hasNoAvailabilityIntent =
    normalized.includes('no contamos') ||
    normalized.includes('no tenemos') ||
    normalized.includes('sin disponibilidad') ||
    normalized.includes('no disponible')

  const talksAboutCatalogOrProducts =
    normalized.includes('catalogo') ||
    normalized.includes('catalgo') ||
    normalized.includes('producto') ||
    normalized.includes('productos')

  return hasNoAvailabilityIntent && talksAboutCatalogOrProducts
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
  // Priorizar respuestas conversacionales locales para evitar respuestas de catalogo en saludos.
  const localSmallTalkReply = buildInteractiveLocalReply(query)
  if (localSmallTalkReply) {
    return localSmallTalkReply
  }

  const hasProducts = Boolean(response.products && response.products.length > 0)
  if (hasProducts && response.message?.trim()) return response.message

  if (!response.message?.trim()) {
    return (
      buildEducationalFallback(query) ??
      'Te ayudo con gusto. Puedes pedirme recomendaciones por presupuesto, uso o comparar componentes.'
    )
  }

  const responseType = normalizeText(response.type || '')
  const messageIsNoProducts = isNoProductsLikeMessage(response.message)
  const typeSuggestsNoProducts =
    responseType.includes('no_product') ||
    responseType.includes('no-products') ||
    responseType.includes('sin_product')

  if (!messageIsNoProducts && !typeSuggestsNoProducts) return response.message

  const educationalFallback = buildEducationalFallback(query)
  if (educationalFallback) {
    return educationalFallback
  }

  if (isInformationalQuestion(query)) {
    return [
      'No encontre un producto exacto para esa consulta, pero si puedo ayudarte con la parte tecnica.',
      'Si quieres, te explico diferencias, compatibilidad o recomendaciones segun tu caso.',
    ].join(' ')
  }

  return [
    'No encontre ese producto exacto en catalogo por ahora.',
    'Si quieres, te puedo recomendar alternativas parecidas.',
    'Dime marca, presupuesto y para que lo usaras, y te propongo opciones reales.',
  ].join(' ')
}

function includesAnyKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword))
}

function buildInteractiveLocalReply(query: string): string | null {
  const normalized = normalizeText(query)

  if (includesAnyKeyword(normalized, GREETING_KEYWORDS)) {
    return [
      'Hola, soy tu asistente de ANTTEC. Listo para ayudarte.',
      'Puedes preguntarme, por ejemplo:',
      '- "Recomiendame una RAM para gaming"',
      '- "Que diferencia hay entre RAM y SSD"',
      '- "Que mouse me recomiendas por 100 soles"',
    ].join('\n')
  }

  if (includesAnyKeyword(normalized, HELP_KEYWORDS)) {
    return [
      'Puedo ayudarte en 3 cosas principales:',
      '1) Recomendar productos por presupuesto y uso.',
      '2) Explicar diferencias tecnicas entre componentes.',
      '3) Buscar disponibilidad de productos en catalogo.',
      'Si quieres, empezamos con: "tengo 300 soles para mejorar mi PC".',
    ].join('\n')
  }

  if (includesAnyKeyword(normalized, THANKS_KEYWORDS)) {
    return 'De nada. Si quieres, te puedo recomendar opciones segun tu presupuesto y tipo de uso.'
  }

  if (includesAnyKeyword(normalized, BYE_KEYWORDS)) {
    return 'Perfecto. Cuando quieras, vuelves y te ayudo con cualquier consulta de productos.'
  }

  return null
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
    const normalizedQuery = query.trim()
    if (!normalizedQuery) return

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: normalizedQuery,
      timestamp: new Date(),
    }
    messages.value.push(userMessage)

    const localReply = buildInteractiveLocalReply(normalizedQuery)
    if (localReply) {
      messages.value.push({
        id: `ai-local-${Date.now()}`,
        type: 'ai',
        content: localReply,
        timestamp: new Date(),
      })
      return
    }

    // Mostrar indicador de carga
    isLoading.value = true

    try {
      // Llamar a la IA
      const response: chatRecommendI = await iaService.chatRecommend(
        normalizedQuery,
        conversationId.value || undefined,
      )

      // Guardar conversation_id
      conversationId.value = response.conversation_id

      const aiContent = resolveAiMessage(normalizedQuery, response)

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
        content:
          buildEducationalFallback(normalizedQuery) ??
          'Ahora mismo no pude conectar con el asistente. Igual te puedo ayudar si me dices tu presupuesto y para que usaras el equipo.',
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
