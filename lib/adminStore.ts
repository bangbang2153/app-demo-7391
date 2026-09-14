import * as fs from "fs"; import * as path from "path"; import * as crypto from "crypto";
const file = path.join(process.cwd(), "data/admin.json");
const metaFile = path.join(process.cwd(), "data/admin.meta.json");
const superMetaFile = path.join(process.cwd(), "data/superadmin.meta.json");
const auditFile = path.join(process.cwd(), "data/admin.audit.log");
type AdminData = {user:string; passHash:string; salt:string};

function hashPass(pass:string, salt:string){
  // ponytail: ganti ke bcrypt saat ada AUTH DB
  return crypto.scryptSync(pass, salt, 64).toString("hex");
}

export function readAdmin(): AdminData {
  try{
    if(fs.existsSync(file)){
      const j = JSON.parse(fs.readFileSync(file,"utf-8"));
      if(j.user && j.passHash) return j;
    }
  }catch{}
  // seed default admin/mashudi123
  const salt = crypto.randomBytes(16).toString("hex");
  const data:AdminData = {user: process.env.ADMIN_USER||"admin", passHash: hashPass(process.env.ADMIN_PASS||"mashudi123", salt), salt};
  try{ fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file, JSON.stringify(data,null,2)); }catch{}
  return data;
}
export function verifyAdmin(user:string, pass:string){
  const d = readAdmin();
  if(user!==d.user) return false;
  return hashPass(pass, d.salt)===d.passHash;
}
export function updateAdmin(user:string, newPass:string){
  const salt = crypto.randomBytes(16).toString("hex");
  const data:AdminData = {user, passHash: hashPass(newPass, salt), salt};
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file, JSON.stringify(data,null,2));
  return data;
}
export function getAdminUser(){ return readAdmin().user; }

// --- meta admin biasa ---
export type AdminMeta = {enabled:boolean; disabledBy:string|null; disabledAt:string|null; reason:string|null; updatedAt:string|null};
export function readAdminMeta(): AdminMeta {
  try{
    if(fs.existsSync(metaFile)){
      const j = JSON.parse(fs.readFileSync(metaFile,"utf-8"));
      if(typeof j.enabled==="boolean") return j as AdminMeta;
    }
  }catch{}
  return {enabled:true, disabledBy:null, disabledAt:null, reason:null, updatedAt:null};
}
export function writeAdminMeta(m:AdminMeta){
  fs.mkdirSync(path.dirname(metaFile),{recursive:true});
  fs.writeFileSync(metaFile, JSON.stringify(m,null,2));
}
export function isAdminEnabled(): boolean { return readAdminMeta().enabled !== false; }
export function setAdminEnabled(enabled:boolean, by:string|null, reason:string|null){
  const now = new Date().toISOString();
  const m: AdminMeta = enabled
    ? {enabled:true, disabledBy:null, disabledAt:null, reason:null, updatedAt:now}
    : {enabled:false, disabledBy:by||"superadmin", disabledAt:now, reason:reason||null, updatedAt:now};
  writeAdminMeta(m);
  auditLog(`${enabled?"ENABLE":"DISABLE"} admin user=${readAdmin().user} by=${by||"cli"} reason=${reason||"-"} at=${now}`);
  return m;
}

// --- superadmin flag (file only) ---
export type SuperMeta = {enabled:boolean; enabledAt:string|null; enabledBy:string|null; disabledAt:string|null; reason:string|null; updatedAt:string|null};
export function readSuperMeta(): SuperMeta {
  try{
    if(fs.existsSync(superMetaFile)){
      const j = JSON.parse(fs.readFileSync(superMetaFile,"utf-8"));
      if(typeof j.enabled==="boolean") return j as SuperMeta;
    }
  }catch{}
  return {enabled:false, enabledAt:null, enabledBy:null, disabledAt:null, reason:"default off", updatedAt:null};
}
export function writeSuperMeta(m:SuperMeta){
  fs.mkdirSync(path.dirname(superMetaFile),{recursive:true});
  fs.writeFileSync(superMetaFile, JSON.stringify(m,null,2));
}
export function isSuperEnabled(): boolean { return readSuperMeta().enabled === true; }
export function setSuperEnabled(enabled:boolean, by:string|null, reason:string|null){
  const now = new Date().toISOString();
  const cur = readSuperMeta();
  const m: SuperMeta = enabled
    ? {enabled:true, enabledAt:now, enabledBy:by||"superadmin", disabledAt:null, reason:reason||null, updatedAt:now}
    : {enabled:false, enabledAt:cur.enabledAt, enabledBy:cur.enabledBy, disabledAt:now, reason:reason||"manual", updatedAt:now};
  writeSuperMeta(m);
  auditLog(`${enabled?"SUPER-ENABLE":"SUPER-DISABLE"} by=${by||"cli"} reason=${reason||"-"} at=${now}`);
  return m;
}

export function auditLog(line:string){
  try{
    fs.mkdirSync(path.dirname(auditFile),{recursive:true});
    fs.appendFileSync(auditFile, `[${new Date().toISOString()}] ${line}\n`);
  }catch{}
}
