import * as fs from "fs"; import * as path from "path"; import * as crypto from "crypto";
const file = path.join(process.cwd(), "data/admin.json");
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
