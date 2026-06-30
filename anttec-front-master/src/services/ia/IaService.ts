import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import httpAdmin from '../httpAdmin'
import httpPublic from '../httpPublic'
import type { chatRecommendI } from '@/interfaces/Ia/ChatRecommendInterface'

class IaService {
  private get api() {
    return httpAdmin
  }

  private get apiPublic() {
    return httpPublic
  }

  async syncCatalog(): Promise<string> {
    const res = await this.api.post<ApiListResponseI<string>>('/ia/sync-catalog')
    console.log(res.data.message)
    return res.data.message
  }

  async chatRecommend(query: string, conversationId?: string): Promise<chatRecommendI> {
    const payload: { query: string; conversation_id?: string } = { query }

    if (conversationId) {
      payload.conversation_id = conversationId
    }

    const res = await this.apiPublic.post<ApiListResponseI<chatRecommendI>>(
      '/ia/recommend',
      payload,
    )

    return res.data.data
  }
}

export default IaService
