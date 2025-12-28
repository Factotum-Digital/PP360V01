import { SITE_CONFIG } from '@/config/site';

/**
 * Calculates the flat exchange rate based on the parallel dollar.
 * Formula: [(Paralelo - 5.4%) - 0.30] - 12% = TASA
 * This rate is applied uniformly to any USD amount.
 */
export function getFlatRate(paraleloRate: number) {
     const { paypal, service } = SITE_CONFIG.fees;

     // 1. apply paypal percentage
     const afterPaypalPercent = paraleloRate * (1 - paypal.percentage);

     // 2. subtract fixed paypal fee from the RATE value
     const afterPaypalFixed = afterPaypalPercent - paypal.fixed;

     // 3. apply service fee
     const finalFlatRate = afterPaypalFixed * (1 - service);

     return Math.max(0, finalFlatRate);
}

/**
 * Calculates metrics based on the flat rate.
 * Resulting VES = USD * FlatRate
 */
export function calculateOrderMetrics(usdAmount: number, paraleloRate: number) {
     const flatRate = getFlatRate(paraleloRate);
     const vesAmount = Math.max(0, usdAmount * flatRate);

     return {
          vesAmount,
          effectiveRate: flatRate, // Now effectiveRate is the same as flatRate
          flatRate
     };
}

/**
 * Legacy compatibility: equivalent to getFlatRate
 */
export function getReferenceRate(paraleloRate: number) {
     return getFlatRate(paraleloRate);
}
