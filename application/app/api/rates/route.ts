import { NextResponse } from 'next/server';
import { fetchExchangeRates } from '@/lib/services/dolar-api';
import { SITE_CONFIG } from '@/config/site';

// Descuento total sobre la tasa paralela (Servicio 12% + PayPal 5.4%)
const TOTAL_DISCOUNT_PERCENT = SITE_CONFIG.fees.service + SITE_CONFIG.fees.paypal.percentage;

export async function GET() {
     const rates = await fetchExchangeRates();

     if (rates.oficial === 0 && rates.paralelo === 0) {
          return NextResponse.json(
               { error: 'Unable to fetch rates from external API' },
               { status: 503 }
          );
     }

     // Calcular la tasa que pagas al cliente (paralelo - comisiones porcentuales)
     const payRate = rates.paralelo * (1 - TOTAL_DISCOUNT_PERCENT);

     return NextResponse.json({
          ...rates,
          // Tasa paralela original de referencia
          paraleloOriginal: rates.paralelo,
          // Tasa que pagas al cliente
          payRate: payRate,
          // Porcentaje de descuento aplicado
          discountPercent: TOTAL_DISCOUNT_PERCENT * 100,
     });
}
