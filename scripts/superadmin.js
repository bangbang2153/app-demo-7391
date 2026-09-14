#!/usr/bin/env node
// MASHUDI superadmin CLI — no deps, scrypt via node crypto
// Usage: node scripts/superadmin.js <cmd> [opts]
//  super-status | super-enable [--reason "..."] | super-disable [--reason "..."]
//  status | enable --user admin | disable --user admin [--reason "..."]
//  reset-pass --user admin --new "xxx" | super-login
const fs = require("fs"), path = require("path"), crypto = require("crypto"), readline = require("readline");

const ROOT = path.join(__dirname, "..");
const adminFile = path.join(ROOT, "data/admin.json");
const metaFile = path.join(ROOT, "data/admin.meta.json");
const superMetaFile = path.join(ROOT, "data/superadmin.meta.json");
const auditFile = path.join(ROOT, "data/admin.audit.log");

function loadEnv(){
  const envPath = path.join(ROOT, ".env");
  if(fs.existsSync(envPath)){
    const t = fs.readFileSync(envPath,"utf-8");
    for(const line of t.split("\n")){
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if(m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
}
loadEnv();

function hashPass(pass,salt){ return crypto.scryptSync(pass,salt,64).toString("hex"); }
function readAdmin(){
  try{
    if(fs.existsSync(adminFile)){
      const j=JSON.parse(fs.readFileSync(adminFile,"utf-8"));
      if(j.user && j.passHash) return j;
    }
  }catch{}
  return null;
}
function readMeta(){
  try{ if(fs.existsSync(metaFile)) return JSON.parse(fs.readFileSync(metaFile,"utf-8")); }catch{}
  return {enabled:true, disabledBy:null, disabledAt:null, reason:null, updatedAt:null};
}
function writeMeta(m){ fs.mkdirSync(path.dirname(metaFile),{recursive:true}); fs.writeFileSync(metaFile, JSON.stringify(m,null,2)); }
function readSuperMeta(){
  try{ if(fs.existsSync(superMetaFile)) return JSON.parse(fs.readFileSync(superMetaFile,"utf-8")); }catch{}
  return {enabled:false, enabledAt:null, enabledBy:null, disabledAt:null, reason:"default off", updatedAt:null};
}
function writeSuperMeta(m){ fs.mkdirSync(path.dirname(superMetaFile),{recursive:true}); fs.writeFileSync(superMetaFile, JSON.stringify(m,null,2)); }
function audit(line){
  try{ fs.mkdirSync(path.dirname(auditFile),{recursive:true}); fs.appendFileSync(auditFile, `[${new Date().toISOString()}] ${line}\n`);}catch{}
}
function getOpt(name){
  const i = process.argv.indexOf(name);
  if(i!==-1 && process.argv[i+1] && !process.argv[i+1].startsWith("--")) return process.argv[i+1];
  const pref = name+"=";
  const f = process.argv.find(a=> a.startsWith(pref));
  if(f) return f.slice(pref.length);
  return null;
}
async function promptPass(q){
  const rl = readline.createInterface({input:process.stdin, output:process.stdout});
  return new Promise(res=> rl.question(q, ans=>{ rl.close(); res(ans.trim()); }));
}
async function checkSuperAuth(){
  const su = process.env.SUPERADMIN_USER || "mashudi_root";
  const sp = process.env.SUPERADMIN_PASS || "mashudi123_super";
  const hashEnv = process.env.SUPERADMIN_PASS_HASH;
  const saltEnv = process.env.SUPERADMIN_SALT || "mashudi-super-salt";
  // if SUPERADMIN_PASS is set in env, try direct compare first
  // else prompt
  let user = su;
  let pass = sp;
  // allow override via --user/--pass opts
  const u = getOpt("--super-user") || getOpt("--su");
  const p = getOpt("--super-pass") || getOpt("--sp");
  if(u) user = u;
  if(p) pass = p;
  // if pass is placeholder or we want interactive, prompt when --prompt
  if(process.argv.includes("--prompt")){
    const iu = await promptPass(`Superadmin user [${user}]: `);
    if(iu) user = iu;
    const ip = await promptPass(`Superadmin pass for ${user}: `);
    if(ip) pass = ip;
  }
  const expectUser = su;
  if(user !== expectUser){
    console.error(`✗ superadmin user salah (expect ${expectUser})`);
    process.exit(1);
  }
  let ok=false;
  if(hashEnv) ok = hashPass(pass, saltEnv) === hashEnv;
  else ok = pass === sp;
  if(!ok){
    console.error("✗ superadmin pass salah");
    process.exit(1);
  }
  return {user, pass};
}

async function main(){
  const cmd = process.argv[2];
  if(!cmd || ["-h","--help","help"].includes(cmd)){
    console.log(`
MASHUDI superadmin.js — super ON/OFF manual + enable/disable admin

  node scripts/superadmin.js super-status
  node scripts/superadmin.js super-enable [--reason "…"]
  node scripts/superadmin.js super-disable [--reason "…"]
  node scripts/superadmin.js status
  node scripts/superadmin.js enable --user admin
  node scripts/superadmin.js disable --user admin [--reason "cuti"]
  node scripts/superadmin.js reset-pass --user admin --new "xxx123"
  node scripts/superadmin.js super-login

Env: SUPERADMIN_USER/PASS (di .env), ADMIN_USER/PASS
`);
    process.exit(0);
  }

  if(cmd==="super-status"){
    const m = readSuperMeta();
    console.log(`SUPERADMIN: ${m.enabled ? "ENABLED ✓" : "DISABLED ✗"}`);
    console.log(JSON.stringify(m,null,2));
    console.log(`\nENV SUPERADMIN_USER=${process.env.SUPERADMIN_USER||"mashudi_root"}`);
    return;
  }
  if(cmd==="super-enable" || cmd==="super-disable"){
    await checkSuperAuth();
    const enable = cmd==="super-enable";
    const reason = getOpt("--reason") || null;
    const by = process.env.SUPERADMIN_USER || "mashudi_root";
    const m = enable
      ? {enabled:true, enabledAt:new Date().toISOString(), enabledBy:by, disabledAt:null, reason:reason, updatedAt:new Date().toISOString()}
      : (()=>{ const cur=readSuperMeta(); return {enabled:false, enabledAt:cur.enabledAt, enabledBy:cur.enabledBy, disabledAt:new Date().toISOString(), reason:reason||"manual", updatedAt:new Date().toISOString()}; })();
    // write via store helper path
    const { writeSuperMeta: wsm } = (()=>{ try{ return require("../lib/adminStore"); }catch{ return {writeSuperMeta}; }})();
    try{ writeSuperMeta(m); }catch{ fs.mkdirSync(path.dirname(superMetaFile),{recursive:true}); fs.writeFileSync(superMetaFile, JSON.stringify(m,null,2)); }
    audit(`${enable?"SUPER-ENABLE":"SUPER-DISABLE"} by=${by} reason=${reason||"-"}`);
    console.log(`${enable?"✓ super ENABLED":"✗ super DISABLED"} — ${reason||""}`);
    console.log(JSON.stringify(m,null,2));
    return;
  }
  if(cmd==="status"){
    const admin = readAdmin();
    const meta = readMeta();
    console.log(`ADMIN user=${admin?admin.user:"(none)"} enabled=${meta.enabled!==false ? "YES":"NO"}`);
    console.log(JSON.stringify({admin: admin?{user:admin.user}:null, meta},null,2));
    const sm = readSuperMeta();
    console.log(`\nSUPERADMIN ${sm.enabled?"ENABLED":"DISABLED"} — ${JSON.stringify(sm)}`);
    return;
  }
  if(cmd==="enable" || cmd==="disable"){
    await checkSuperAuth();
    const user = getOpt("--user");
    if(!user){ console.error("butuh --user <name>"); process.exit(1); }
    const admin = readAdmin();
    if(admin && admin.user !== user){
      console.warn(`warn: admin file user=${admin.user} != ${user} — tetap set meta (login cek user juga)`);
    }
    const reason = getOpt("--reason") || null;
    const by = process.env.SUPERADMIN_USER || "mashudi_root";
    const enable = cmd==="enable";
    const now = new Date().toISOString();
    const m = enable
      ? {enabled:true, disabledBy:null, disabledAt:null, reason:null, updatedAt:now}
      : {enabled:false, disabledBy:by, disabledAt:now, reason:reason, updatedAt:now};
    writeMeta(m);
    audit(`${enable?"ENABLE":"DISABLE"} admin user=${user} by=${by} reason=${reason||"-"}`);
    console.log(`${enable?"✓ ENABLED":"✗ DISABLED"} user=${user} ${reason?"reason="+reason:""}`);
    console.log(JSON.stringify(m,null,2));
    return;
  }
  if(cmd==="reset-pass"){
    await checkSuperAuth();
    const user = getOpt("--user");
    const nw = getOpt("--new") || getOpt("--pass");
    if(!user || !nw){ console.error("butuh --user <name> --new <pass>"); process.exit(1); }
    if(nw.length<6){ console.error("pass min 6 char"); process.exit(1); }
    const salt = crypto.randomBytes(16).toString("hex");
    const data = {user, passHash: hashPass(nw, salt), salt};
    fs.mkdirSync(path.dirname(adminFile),{recursive:true});
    fs.writeFileSync(adminFile, JSON.stringify(data,null,2));
    audit(`RESET-PASS user=${user} by=${process.env.SUPERADMIN_USER||"cli"}`);
    console.log(`✓ password reset user=${user}`);
    return;
  }
  if(cmd==="super-login"){
    const user = process.argv[3] || (await promptPass(`user [${process.env.SUPERADMIN_USER||"mashudi_root"}]: `)) || process.env.SUPERADMIN_USER||"mashudi_root";
    const pass = process.argv[4] || await promptPass(`pass for ${user}: `);
    const su = process.env.SUPERADMIN_USER||"mashudi_root";
    const sp = process.env.SUPERADMIN_PASS||"mashudi123_super";
    const ok = user===su && pass===sp;
    console.log(ok ? "✓ super credential OK" : "✗ salah");
    process.exit(ok?0:1);
  }
  console.error("cmd tidak dikenal:", cmd);
  process.exit(1);
}
main().catch(e=>{ console.error(e); process.exit(1); });
