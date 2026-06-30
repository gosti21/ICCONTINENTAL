import type { ApiListResponseI } from '@/interfaces/admin/base/ApiListResponseInterface'
import httpPublic from '../httpPublic'
import type { variantSI } from '@/interfaces/shop/Variant/VariantSInterface'
import httpStrict from '../httpStrict'

class VariantSService {
  private get api() {
    return httpPublic
  }

  private get apiStrict() {
    return httpStrict
  }

  async getVariant(productId: string | number, variantId: string | number): Promise<variantSI> {
    const res = await this.apiStrict.get<ApiListResponseI<variantSI>>(
      `/products/${productId}/variants/${variantId}`,
    )
    console.log(res.data.message)
    return res.data.data
  }
}

export default VariantSService
