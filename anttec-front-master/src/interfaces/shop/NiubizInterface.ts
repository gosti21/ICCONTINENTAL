export interface NiubizPaymentResponse {
  transactionToken: string
  errorCode?: string
  errorMessage?: string
  actionDescription?: string
  [key: string]: unknown // Para cualquier otro campo que Niubiz pueda devolver
}

export interface NiubizConfig {
  sessiontoken: string
  channel: string
  merchantid: string
  purchasenumber: string
  amount: number
  expirationminutes: string
  timeouturl: string
  method: string
  merchantname: string
  merchantlogo: string
  formbuttoncolor: string
  action: string
  complete: (params: NiubizPaymentResponse) => void
}

export interface VisanetCheckout {
  configure: (config: NiubizConfig) => void
  open: () => void
  close: () => void
}
