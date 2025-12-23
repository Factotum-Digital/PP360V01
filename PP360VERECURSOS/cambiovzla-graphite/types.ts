export enum BankCode {
    BANESCO = '0134',
    MERCANTIL = '0105',
    BDV = '0102',
    PROVINCIAL = '0108',
    BNC = '0191',
    BANCAMIGA = '0172'
}

export interface Bank {
    code: BankCode;
    name: string;
}

export interface ExchangeRate {
    date: string;
    rate: number;
}

export enum PaymentMethod {
    PAGO_MOVIL = 'Pago Móvil',
    TRANSFERENCIA = 'Transferencia'
}

export interface ExchangeFormData {
    usdAmount: number;
    vefAmount: number;
    paymentMethod: PaymentMethod;
    fullName: string;
    cedula: string;
    bank: string;
    phoneNumber?: string; // For Pago Movil
    accountNumber?: string; // For Transfer
    paypalEmail: string;
}
