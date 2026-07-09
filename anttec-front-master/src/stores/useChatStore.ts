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
const MOST_EXPENSIVE_KEYWORDS = [
  'mas caro',
  'más caro',
  'mayor precio',
  'precio mas alto',
  'precio más alto',
  'el mas caro',
  'el más caro',
]
const CHEAPEST_KEYWORDS = [
  'mas barato',
  'más barato',
  'menor precio',
  'precio mas bajo',
  'precio más bajo',
  'el mas barato',
  'el más barato',
  'economico',
  'económico',
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
  const asksAboutPernoAndTuerca = normalized.includes('perno') && normalized.includes('tuerca')

  if (asksAboutPernoAndTuerca) {
    return [
      'Claro. Te explico la diferencia entre perno y tuerca:',
      '',
      '1) Perno: elemento macho que atraviesa o fija piezas.',
      '2) Tuerca: elemento hembra que enrosca sobre el perno para asegurar el ajuste.',
      '3) La compatibilidad depende de diametro, paso de rosca y grado de resistencia.',
      '4) En maquinaria pesada tambien importa el material (acero, inoxidable, galvanizado) y el torque de trabajo.',
      '',
      'Si quieres, te ayudo a elegir la combinacion correcta segun medida y aplicacion.',
    ].join('\n')
  }

  if (isInformationalQuestion(query)) {
    return [
      'Puedo ayudarte con preguntas tecnicas y comparaciones de pernos, tuercas y arandelas.',
      'Tambien puedo recomendarte productos segun presupuesto y uso en maquinaria pesada.',
      'Si quieres, dime medida, rosca y aplicacion para sugerirte opciones concretas.',
    ].join(' ')
  }

  return null
}

function extractBudget(query: string): string | null {
  const normalized = normalizeText(query)
  const match = normalized.match(/(\d+[\.,]?\d*)\s*(soles|s\/|s\/\.|pen)/)
  if (!match) return null
  return match[1].replace(',', '.')
}

function detectCategory(query: string): string | null {
  const normalized = normalizeText(query)

  if (normalized.includes('perno') || normalized.includes('pernos')) return 'pernos'
  if (normalized.includes('tuerca') || normalized.includes('tuercas')) return 'tuercas'
  if (normalized.includes('arandela') || normalized.includes('arandelas')) return 'arandelas'
  if (normalized.includes('esparrago') || normalized.includes('espárrago')) return 'esparragos'
  if (normalized.includes('bulon') || normalized.includes('bulón')) return 'bulones'
  if (normalized.includes('anclaje')) return 'anclajes'
  if (normalized.includes('maquinaria') || normalized.includes('pesada')) return 'fijacion para maquinaria pesada'

  return null
}

function getProductMaxPrice(product: productIAI): number {
  if (!product.variants || product.variants.length === 0) return 0
  return Math.max(...product.variants.map((variant) => variant.price || 0))
}

function getProductMinPrice(product: productIAI): number {
  if (!product.variants || product.variants.length === 0) return 0
  return Math.min(...product.variants.map((variant) => variant.price || 0))
}

function isMostExpensiveQuery(query: string): boolean {
  const normalized = normalizeText(query)
  return MOST_EXPENSIVE_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

function isSingleMostExpensiveQuery(query: string): boolean {
  const normalized = normalizeText(query)
  return isMostExpensiveQuery(query) && (normalized.includes('el ') || normalized.includes('uno'))
}

function isCheapestQuery(query: string): boolean {
  const normalized = normalizeText(query)
  return CHEAPEST_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

function isSingleCheapestQuery(query: string): boolean {
  const normalized = normalizeText(query)
  return isCheapestQuery(query) && (normalized.includes('el ') || normalized.includes('uno'))
}

function prioritizeProductsByQuery(query: string, products: productIAI[] | null): productIAI[] | undefined {
  if (!products || products.length === 0) return undefined

  if (isMostExpensiveQuery(query)) {
    const sortedByPriceDesc = [...products].sort(
      (a, b) => getProductMaxPrice(b) - getProductMaxPrice(a),
    )

    if (isSingleMostExpensiveQuery(query)) {
      return sortedByPriceDesc.slice(0, 1)
    }

    return sortedByPriceDesc
  }

  if (isCheapestQuery(query)) {
    const sortedByPriceAsc = [...products].sort(
      (a, b) => getProductMinPrice(a) - getProductMinPrice(b),
    )

    if (isSingleCheapestQuery(query)) {
      return sortedByPriceAsc.slice(0, 1)
    }

    return sortedByPriceAsc
  }

  return products
}

function buildSalesAssistantReply(query: string): string {
  const educational = buildEducationalFallback(query)
  if (educational) {
    return `${educational}\n\nSi quieres, tambien te propongo opciones segun tu presupuesto.`
  }

  const budget = extractBudget(query)
  const category = detectCategory(query)

  if (category && budget) {
    return [
      `Perfecto, te ayudo como asesor para buscar ${category} por S/ ${budget}.`,
      'Para recomendarte bien, confirmame 2 cosas:',
      '1) Medida/tipo de rosca (por ejemplo M10x1.5).',
      '2) Aplicacion (estructura, vibracion, maquinaria pesada, etc.).',
      'Con eso te paso opciones concretas y una recomendacion final.',
    ].join('\n')
  }

  if (category) {
    return [
      `Excelente, te ayudo a elegir un ${category}.`,
      'Dime tu presupuesto aproximado en soles y la aplicacion.',
      'Ejemplo: "quiero pernos M12 para maquinaria pesada por 200 soles".',
    ].join('\n')
  }

  if (budget) {
    return [
      `Genial, trabajemos con un presupuesto de S/ ${budget}.`,
      'Que producto buscas exactamente (pernos, tuercas, arandelas, anclajes)?',
      'Tambien dime medida, rosca y aplicacion para darte una recomendacion precisa.',
    ].join('\n')
  }

  return [
    'Te atiendo como asesor tecnico y te ayudo a elegir la mejor opcion.',
    'Para empezar, dime:',
    '1) Que producto buscas (perno, tuerca, arandela, anclaje).',
    '2) Tu presupuesto en soles.',
    '3) Medida/rosca y para que aplicacion lo usaras (maquinaria pesada, estructura, etc.).',
  ].join('\n')
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
    return buildSalesAssistantReply(query)
  }

  const responseType = normalizeText(response.type || '')
  const messageIsNoProducts = isNoProductsLikeMessage(response.message)
  const typeSuggestsNoProducts =
    responseType.includes('no_product') ||
    responseType.includes('no-products') ||
    responseType.includes('sin_product')

  if (!messageIsNoProducts && !typeSuggestsNoProducts) return response.message

  return buildSalesAssistantReply(query)
}

function includesAnyKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword))
}

function buildInteractiveLocalReply(query: string): string | null {
  const normalized = normalizeText(query)

  if (includesAnyKeyword(normalized, GREETING_KEYWORDS)) {
    return [
      'Hola, soy tu asistente de FERREBOM. Listo para ayudarte.',
      'Puedes preguntarme, por ejemplo:',
      '- "Recomiendame pernos para maquinaria pesada"',
      '- "Que diferencia hay entre perno grado 8.8 y 10.9"',
      '- "Cual es el producto mas barato y cual el mas caro"',
    ].join('\n')
  }

  if (includesAnyKeyword(normalized, HELP_KEYWORDS)) {
    return [
      'Puedo ayudarte en 3 cosas principales:',
      '1) Recomendar pernos, tuercas y arandelas por presupuesto y aplicacion.',
      '2) Explicar diferencias tecnicas de rosca, grado, material y resistencia.',
      '3) Buscar disponibilidad en catalogo y darte atajo directo al producto para comprar.',
      'Si quieres, empezamos con: "tengo 300 soles para pernos M12 de alta resistencia".',
    ].join('\n')
  }

  if (includesAnyKeyword(normalized, THANKS_KEYWORDS)) {
    return 'De nada. Si quieres, te recomiendo opciones segun medida, presupuesto y aplicacion.'
  }

  if (includesAnyKeyword(normalized, BYE_KEYWORDS)) {
    return 'Perfecto. Cuando quieras, vuelves y te ayudo con cualquier consulta de pernos, tuercas o maquinaria pesada.'
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
      const prioritizedProducts = prioritizeProductsByQuery(normalizedQuery, response.products)

      // Agregar respuesta de la IA
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: aiContent,
        timestamp: new Date(),
        products: prioritizedProducts,
      }
      messages.value.push(aiMessage)
    } catch (error) {
      console.error('Error en chat:', error)

      // Mensaje de error
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: buildSalesAssistantReply(normalizedQuery),
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
          'Hola. Soy tu asistente FERREBOM para pernos, tuercas, arandelas y maquinaria pesada. ¿Que necesitas hoy?',
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
