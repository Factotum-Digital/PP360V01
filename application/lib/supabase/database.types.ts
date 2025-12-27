export type Json =
     | string
     | number
     | boolean
     | null
     | { [key: string]: Json | undefined }
     | Json[]

export interface Database {
     public: {
          Tables: {
               exchange_rates: {
                    Row: {
                         id: number
                         pair: string
                         rate: number
                         buy_price: number
                         sell_price: number
                         is_active: boolean
                         created_at: string
                         updated_at: string
                    }
                    Insert: {
                         id?: number
                         pair: string
                         rate: number
                         buy_price: number
                         sell_price: number
                         is_active?: boolean
                         created_at?: string
                         updated_at?: string
                    }
                    Update: {
                         id?: number
                         pair?: string
                         rate?: number
                         buy_price?: number
                         sell_price?: number
                         is_active?: boolean
                         created_at?: string
                         updated_at?: string
                    }
               }
               exchange_orders: {
                    Row: {
                         order_id: string
                         user_id: string | null
                         amount_sent: number
                         currency_sent: string
                         amount_received: number
                         currency_received: string
                         status: 'PENDING' | 'VERIFYING' | 'COMPLETED' | 'CANCELLED' | string
                         payment_proof_url: string | null
                         destination_data: Json | null
                         created_at: string
                         // Guest order fields
                         ticket_id: string | null
                         paypal_email: string | null
                         bank_name: string | null
                         id_number: string | null
                         phone_pago_movil: string | null
                         whatsapp: string | null
                         is_guest: boolean
                         exchange_rate: number | null
                         is_archived: boolean
                    }
                    Insert: {
                         order_id?: string
                         user_id?: string | null
                         amount_sent: number
                         currency_sent?: string
                         amount_received: number
                         currency_received?: string
                         status?: 'PENDING' | 'VERIFYING' | 'COMPLETED' | 'CANCELLED'
                         payment_proof_url?: string | null
                         destination_data?: Json | null
                         created_at?: string
                         // Guest order fields
                         ticket_id?: string | null
                         paypal_email?: string | null
                         bank_name?: string | null
                         id_number?: string | null
                         phone_pago_movil?: string | null
                         whatsapp?: string | null
                         is_guest?: boolean
                         exchange_rate?: number | null
                    }
                    Update: {
                         order_id?: string
                         user_id?: string | null
                         amount_sent?: number
                         currency_sent?: string
                         amount_received?: number
                         currency_received?: string
                         status?: 'PENDING' | 'VERIFYING' | 'COMPLETED' | 'CANCELLED'
                         payment_proof_url?: string | null
                         destination_data?: Json | null
                         created_at?: string
                         // Guest order fields
                         ticket_id?: string | null
                         paypal_email?: string | null
                         bank_name?: string | null
                         id_number?: string | null
                         phone_pago_movil?: string | null
                         whatsapp?: string | null
                         is_guest?: boolean
                         exchange_rate?: number | null
                    }
               }
               user_payment_data: {
                    Row: {
                         id: string
                         user_id: string
                         bank_name: string | null
                         id_number: string | null
                         phone_pago_movil: string | null
                         account_number: string | null
                         account_holder: string | null
                         paypal_verified: boolean
                         created_at: string
                         updated_at: string
                    }
                    Insert: {
                         id?: string
                         user_id: string
                         bank_name?: string | null
                         id_number?: string | null
                         phone_pago_movil?: string | null
                         account_number?: string | null
                         account_holder?: string | null
                         created_at?: string
                         updated_at?: string
                    }
                    Update: {
                         id?: string
                         user_id?: string
                         bank_name?: string | null
                         id_number?: string | null
                         phone_pago_movil?: string | null
                         account_number?: string | null
                         account_holder?: string | null
                         created_at?: string
                         updated_at?: string
                    }
               }
          }
     }
}

export type ExchangeRate = Database['public']['Tables']['exchange_rates']['Row']
export type ExchangeOrder = Database['public']['Tables']['exchange_orders']['Row']
export type NewExchangeOrder = Database['public']['Tables']['exchange_orders']['Insert']
export type UserPaymentData = Database['public']['Tables']['user_payment_data']['Row']
export type NewUserPaymentData = Database['public']['Tables']['user_payment_data']['Insert']
