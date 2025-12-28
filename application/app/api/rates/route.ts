import { NextResponse } from 'next/server';
import { fetchExchangeRates } from '@/lib/services/dolar-api';
import { SITE_CONFIG } from '@/config/site';
import { getReferenceRate } from '@/lib/rate-calculator';

/**
 * API Route: Calculates and returns official and parallel exchange rates.
 * Applied sequence formula: [(X$ - 5.4%) - 0.30$] - 12% = TASA
 */
export async function GET() {
     const rates = await fetchExchangeRates();

     if (rates.oficial === 0 && rates.paralelo === 0) {
          return NextResponse.json(
               { error: 'Unable to fetch rates from external API' },
               { status: 503 }
          );
     }

     // Cálculo unificado usando la utilidad centralizada
     const payRate = getReferenceRate(rates.paralelo);

     return NextResponse.json({
          ...rates,
          paraleloOriginal: rates.paralelo,
          baseRate: rates.paralelo,
          payRate: payRate,
          fees: {
               paypal: SITE_CONFIG.fees.paypal,
               service: SITE_CONFIG.fees.service
          }
     });
}
