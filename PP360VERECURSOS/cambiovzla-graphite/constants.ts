import { Bank, BankCode, ExchangeRate } from "./types";

export const VENEZUELAN_BANKS: Bank[] = [
    { code: BankCode.BANESCO, name: 'Banesco' },
    { code: BankCode.MERCANTIL, name: 'Mercantil' },
    { code: BankCode.BDV, name: 'Banco de Venezuela' },
    { code: BankCode.PROVINCIAL, name: 'BBVA Provincial' },
    { code: BankCode.BNC, name: 'BNC' },
    { code: BankCode.BANCAMIGA, name: 'Bancamiga' },
];

// Mock current rate (Simulating a real-time feed)
export const CURRENT_RATE = 68.45; // VEF per USD
export const COMISSION_RATE = 0.05; // 5% Service Fee

export const RATE_HISTORY: ExchangeRate[] = [
    { date: 'Mon', rate: 66.20 },
    { date: 'Tue', rate: 66.80 },
    { date: 'Wed', rate: 67.10 },
    { date: 'Thu', rate: 67.90 },
    { date: 'Fri', rate: 68.10 },
    { date: 'Sat', rate: 68.25 },
    { date: 'Sun', rate: 68.45 },
];
