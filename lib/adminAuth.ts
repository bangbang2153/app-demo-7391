export const ADMIN_TOKEN = "mashudi-admin-v1";
export const SUPERADMIN_TOKEN = process.env.SUPERADMIN_TOKEN || "mashudi-super-v1-acak";

// ponytail: ganti ke JWT + bcrypt + DB saat skala naik
export function isValidToken(t: string | undefined){ return t === ADMIN_TOKEN; }
export function isValidSuperToken(t: string | undefined){ return t === SUPERADMIN_TOKEN; }

export function getSuperAdminUser(){ return process.env.SUPERADMIN_USER || "mashudi_root"; }
export function getSuperAdminPass(){ return process.env.SUPERADMIN_PASS || "mashudi123_super"; }
export function getAdminPath(){ return (process.env.ADMIN_PATH || "mashudi").replace(/^\/+|\/+$/g,"") || "mashudi"; }

import * as crypto from "crypto";
function hashPass(pass:string, salt:string){ return crypto.scryptSync(pass, salt, 64).toString("hex"); }

// dipakai di login route: cek apakah user/pass adalah superadmin (env-based, scrypt kalau ada salt di env hash)
export function isSuperAdminCredentials(user:string, pass:string): boolean {
  const su = getSuperAdminUser();
  const sp = getSuperAdminPass();
  if(user !== su) return false;
  // SUPERADMIN_PASS_HASH support (hash hex 128 char) else plain compare via scrypt dengan salt env atau direct
  const hashEnv = process.env.SUPERADMIN_PASS_HASH;
  if(hashEnv){
    const salt = process.env.SUPERADMIN_SALT || "mashudi-super-salt";
    return hashPass(pass, salt) === hashEnv;
  }
  return pass === sp;
}
