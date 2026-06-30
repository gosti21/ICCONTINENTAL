import type { variantBarcodeDTO } from '@/DTOs/admin/VariantBarcodeDTO'
import httpAdmin from '../httpAdmin'

class VariantBarcodeService {
  private get api() {
    return httpAdmin
  }

  async generatePDF(data: variantBarcodeDTO): Promise<Blob> {
    const res = await this.api.post<Blob>('/admin/variants/barcodes/generate', data, {
      responseType: 'blob',
    })
    return res.data
  }
}

export default VariantBarcodeService
