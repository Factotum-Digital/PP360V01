import { NextResponse } from 'next/server';
import { fetchExchangeRates } from '@/lib/services/dolar-api';
import { SITE_CONFIG } from '@/config/site';

// Descuento total sobre la tasa paralela (Servicio 12% + PayPal 5.4%)
const TOTAL_DISCOUNT_PERCENT = SITE_CONFIG.fees.service + SITE_CONFIG.fees.paypal.percentage;

// Cálculo secuencial: (Monto * (1 - 5.4%) - 0.30) * (1 - 12%)
export async function GET() {
     const rates = await fetchExchangeRates();

     if (rates.oficial === 0 && rates.paralelo === 0) {
          return NextResponse.json(
               { error: 'Unable to fetch rates from external API' },
               { status: 503 }
          );
     }

     // Cálculo secuencial de referencia para $100
     const paypalRate = 1 - SITE_CONFIG.fees.paypal.percentage;
     const serviceRate = 1 - SITE_CONFIG.fees.service;
     const paypalFixed = SITE_CONFIG.fees.paypal.fixed;

     const referenceAmount = 100;
     const netAfterPaypal = (referenceAmount * paypalRate) - paypalFixed;
     const finalNetUSD = netAfterPaypal * serviceRate;
     const referenceFactor = finalNetUSD / referenceAmount;

     return NextResponse.json({
          ...rates,
          paraleloOriginal: rates.paralelo,
          // La tasa efectiva depende del monto debido al fee fijo de $0.30
          // Devolvemos los componentes para que el cliente calcule exacto
          baseRate: rates.paralelo,
          referenceNetFactor: referenceFactor, // Solo como info (0.82984)
          fees: {
               paypal: SITE_CONFIG.fees.paypal,
               service: SITE_CONFIG.fees.service
          }
     });
}
