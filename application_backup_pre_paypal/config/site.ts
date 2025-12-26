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

     // Commission structure (percentage)
     commission: {
          display: 0.05,    // 5% - What we show to the user
          total: 0.05,      // 5% total commission
     },

     // Transaction limits
     validation: {
          minAmount: 10,
          maxAmount: 500,
     },
};
