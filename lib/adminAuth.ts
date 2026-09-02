export const ADMIN_USER = process.env.ADMIN_USER || "admin";
export const ADMIN_PASS = process.env.ADMIN_PASS || "mashudi123";
export const ADMIN_TOKEN = "mashudi-admin-v1";
// ponytail: ganti ke JWT + bcrypt + DB saat skala naik
export function isValidToken(t: string | undefined){ return t === ADMIN_TOKEN; }
