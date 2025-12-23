// Lista de correos de administradores
export const ADMIN_EMAILS = [
     'wilfredy54@gmail.com',
];

export function isAdmin(email: string | undefined): boolean {
     if (!email) return false;
     return ADMIN_EMAILS.includes(email.toLowerCase());
}
