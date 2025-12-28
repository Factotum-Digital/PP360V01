// Lista completa de bancos venezolanos
// Centralizada para evitar duplicación y garantizar consistencia

export const VENEZUELAN_BANKS = [
     'Banesco',
     'Mercantil',
     'Banco de Venezuela',
     'Provincial',
     'BOD',
     'BNC',
     'Banco Exterior',
     'Banco Caroní',
     'Banco Sofitasa',
     'Banco Venezolano de Crédito',
     'BanCaribe',
     'Banco Plaza',
     'Banco del Tesoro',
     'Banfanb',
     '100% Banco',
     'Banco Activo',
     'Bancrecer',
     'Mi Banco',
     'Banco Bicentenario'
] as const;

export type VenezuelanBank = typeof VENEZUELAN_BANKS[number];
