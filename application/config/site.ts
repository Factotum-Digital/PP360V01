export const SITE_CONFIG = {
     name: "PP360VE",
     description: "Brutalist Exchange Terminal",

     // API Endpoints
     api: {
          rates: "/api/rates",
          dolarApiBase: "https://ve.dolarapi.com/v1/dolares",
     },

     // Default fallback rates (used if API fails)
     fallbackRates: {
          oficial: 54.42,   // BCV Official rate (shown to users)
          paralelo: 58.50,  // Parallel rate (internal use only)
     },

     // Commission fees structure
     fees: {
          service: 0.12,      // 12% service fee
          paypal: {
               percentage: 0.054, // 5.4% PayPal fee
               fixed: 0.30,       // $0.30 fixed fee
          }
     },

     // Transaction limits
     validation: {
          minAmount: 5,  // Minimum USD amount
          maxAmount: 500,
     },
};
