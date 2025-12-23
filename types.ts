export enum AppStep {
     QUOTATION = 'QUOTATION',
     VALIDATION = 'VALIDATION',
     SUCCESS = 'SUCCESS'
}

export interface ExchangeData {
     usdAmount: number;
     vesAmount: number;
     rate: number;
     email: string;
     bank: string;
     idNumber: string;
     phone: string;
     whatsapp: string;
}

export interface TerminalLog {
     id: string;
     timestamp: string;
     message: string;
     type: 'info' | 'success' | 'warning';
}
