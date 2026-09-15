import { NextRequest, NextResponse } from "next/server";
import { isValidToken, isValidSuperToken, isSuperAdminCredentials, SUPERADMIN_TOKEN } from "@/lib/adminAuth";
import { verifyAdmin, readAdmin, updateAdmin, isAdminEnabled, isSuperEnabled } from "@/lib/adminStore";

export async function POST(req: NextRequest){
  const {user, pass} = await req.json().catch(()=>({}));
  const u = String(user||"").trim();
  const p = String(pass||"");
  // superadmin branch dulu (bypass admin enabled check)
  if(isSuperAdminCredentials(u,p)){
    if(!isSuperEnabled()){
      return NextResponse.json({error:"Superadmin sedang OFF — hubungi owner: jalankan 'node scripts/superadmin.js super-enable' di VPS"}, {status:403});
    }
    const res = NextResponse.json({ok:true, user: u, super:true});
    res.cookies.set("mashudi_super", SUPERADMIN_TOKEN, {path:"/", maxAge:60*60*24*7, sameSite:"lax"});
    // super juga dapat admin cookie biar bisa akses /api/admin/* dan page checkAuth (document.cookie readable)
    res.cookies.set("mashudi_admin", "mashudi-admin-v1", {path:"/", maxAge:60*60*24*7, sameSite:"lax"});
    return res;
  }
  // admin biasa — cek enabled
  if(!isAdminEnabled()){
    return NextResponse.json({error:"Akun admin dinonaktifkan oleh superadmin — hubungi owner"}, {status:403});
  }
  if(verifyAdmin(u, p)){
    const res = NextResponse.json({ok:true, user: readAdmin().user});
    res.cookies.set("mashudi_admin", "mashudi-admin-v1", {path:"/", maxAge:60*60*24*7, sameSite:"lax"});
    return res;
  }
  return NextResponse.json({error:"User/pass salah"}, {status:401});
}
export async function PUT(req: NextRequest){
  const token = req.cookies.get("mashudi_admin")?.value;
  const superTok = req.cookies.get("mashudi_super")?.value;
  const authed = isValidToken(token) || isValidSuperToken(superTok);
  if(!authed) return NextResponse.json({error:"Unauthorized - login dulu"}, {status:401});
  const {currentPass, newUser, newPass, confirmPass} = await req.json().catch(()=>({}));
  const cur = readAdmin();
  if(!verifyAdmin(cur.user, String(currentPass||""))) return NextResponse.json({error:"Password lama salah"}, {status:400});
  if(!newPass || String(newPass).length<6) return NextResponse.json({error:"Password baru min 6 karakter"}, {status:400});
  if(newPass!==confirmPass) return NextResponse.json({error:"Konfirmasi password tidak cocok"}, {status:400});
  const user = String(newUser||cur.user).trim() || cur.user;
  updateAdmin(user, String(newPass));
  const res = NextResponse.json({ok:true, user});
  res.cookies.set("mashudi_admin", "mashudi-admin-v1", {path:"/", maxAge:60*60*24*7, sameSite:"lax"});
  return res;
}
export async function DELETE(){
  const res = NextResponse.json({ok:true});
  res.cookies.set("mashudi_admin","",{path:"/", maxAge:0});
  res.cookies.set("mashudi_super","",{path:"/", maxAge:0});
  return res;
}
export async function GET(req: NextRequest){
  const token = req.cookies.get("mashudi_admin")?.value;
  const superTok = req.cookies.get("mashudi_super")?.value;
  if(!isValidToken(token) && !isValidSuperToken(superTok)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  return NextResponse.json({user: readAdmin().user, super: isValidSuperToken(superTok)});
}
