import { NextResponse } from 'next/server';
import { fetchExchangeRates } from '@/lib/services/dolar-api';

// Descuento sobre la tasa paralela (15%)
const DISCOUNT_RATE = 0.15;

export async function GET() {
     const rates = await fetchExchangeRates();

     if (rates.oficial === 0 && rates.paralelo === 0) {
          return NextResponse.json(
               { error: 'Unable to fetch rates from external API' },
               { status: 503 }
          );
     }

     // Calcular la tasa que pagas al cliente (paralelo - 15%)
     const payRate = rates.paralelo * (1 - DISCOUNT_RATE);

     return NextResponse.json({
          ...rates,
          // Tasa paralela original de referencia
          paraleloOriginal: rates.paralelo,
          // Tasa que pagas al cliente (15% menos)
          payRate: payRate,
          // Porcentaje de descuento aplicado
          discountPercent: DISCOUNT_RATE * 100,
     });
}
