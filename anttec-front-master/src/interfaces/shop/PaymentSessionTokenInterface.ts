export interface paymentSessionTokenSI {
  session_token: string
  order_id: number
  total: number
  merchant_id: string | null
  action_url: string
}
