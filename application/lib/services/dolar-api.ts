// Types for the DolarAPI response
export interface DolarApiResponse {
     fuente: 'oficial' | 'paralelo';
     nombre: string;
     compra: number | null;
     venta: number | null;
     promedio: number;
     fechaActualizacion: string;
}

export interface ExchangeRates {
     oficial: number;
     paralelo: number;
     lastUpdated: string;
}

const DOLAR_API_BASE = 'https://ve.dolarapi.com/v1/dolares';

/**
 * Fetch both official and parallel dollar rates from DolarAPI
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
     try {
          const [oficialRes, paraleloRes] = await Promise.all([
               fetch(`${DOLAR_API_BASE}/oficial`, { next: { revalidate: 300 } }), // Cache for 5 min
               fetch(`${DOLAR_API_BASE}/paralelo`, { next: { revalidate: 300 } }),
          ]);

          if (!oficialRes.ok || !paraleloRes.ok) {
               throw new Error('Failed to fetch rates from DolarAPI');
          }

          const oficial: DolarApiResponse = await oficialRes.json();
          const paralelo: DolarApiResponse = await paraleloRes.json();

          return {
               oficial: oficial.promedio,
               paralelo: paralelo.promedio,
               lastUpdated: oficial.fechaActualizacion,
          };
     } catch (error) {
          console.error('Error fetching exchange rates:', error);
          // Return fallback rates if API fails
          return {
               oficial: 0,
               paralelo: 0,
               lastUpdated: new Date().toISOString(),
          };
     }
}

/**
 * Fetch a single rate type
 */
export async function fetchSingleRate(type: 'oficial' | 'paralelo'): Promise<DolarApiResponse | null> {
     try {
          const res = await fetch(`${DOLAR_API_BASE}/${type}`, { next: { revalidate: 300 } });
          if (!res.ok) return null;
          return res.json();
     } catch {
          return null;
     }
}
