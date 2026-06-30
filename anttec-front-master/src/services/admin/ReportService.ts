import httpAdmin from '../httpAdmin'

// Interfaces para los reportes
export interface LowStockRequestI {
  format: 'pdf' | 'excel'
}

export interface SalesReportRequestI {
  format: 'pdf' | 'excel'
  date_from: string
  date_to: string
}

export interface ReportResponseI {
  file: string // Base64 string
  filename: string
}

class ReportService {
  private get api() {
    return httpAdmin
  }

  async generateLowStockReport(data: LowStockRequestI): Promise<ReportResponseI> {
    const res = await this.api.post<ReportResponseI>('/admin/reports/low-stock', data)
    return res.data
  }

  async generateSalesReport(data: SalesReportRequestI): Promise<ReportResponseI> {
    const res = await this.api.post<ReportResponseI>('/admin/reports/sales', data)
    return res.data
  }

  // Función auxiliar para descargar el archivo
  downloadFile(base64Data: string, filename: string) {
    const link = document.createElement('a')
    link.href = base64Data
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export default ReportService
