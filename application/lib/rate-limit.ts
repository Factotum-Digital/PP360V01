export class RateLimit {
     private static requests = new Map<string, number[]>();

     // Limites configurables
     private static readonly WINDOW_MS = 60 * 1000; // 1 minuto
     private static readonly MAX_REQUESTS = 100; // 100 intentos por minuto (Dev/Test friendly)

     static check(identifier: string): boolean {
          const now = Date.now();
          const timestamps = this.requests.get(identifier) || [];

          // Filtrar timestamps viejos fuera de la ventana
          const windowStart = now - this.WINDOW_MS;
          const activeTimestamps = timestamps.filter(t => t > windowStart);

          if (activeTimestamps.length >= this.MAX_REQUESTS) {
               return false; // Rate limit exceeded
          }

          // Agregar nuevo timestamp
          activeTimestamps.push(now);
          this.requests.set(identifier, activeTimestamps);

          // Limpieza oportunista (evitar memory leaks)
          if (this.requests.size > 1000) {
               this.cleanup(windowStart);
          }

          return true;
     }

     private static cleanup(windowStart: number) {
          for (const [key, stamps] of this.requests.entries()) {
               const valid = stamps.filter(t => t > windowStart);
               if (valid.length === 0) {
                    this.requests.delete(key);
               } else {
                    this.requests.set(key, valid);
               }
          }
     }
}
