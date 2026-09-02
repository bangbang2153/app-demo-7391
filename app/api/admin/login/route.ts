import { NextRequest, NextResponse } from "next/server";
import { isValidToken } from "@/lib/adminAuth";
import { verifyAdmin, readAdmin, updateAdmin } from "@/lib/adminStore";

export async function POST(req: NextRequest){
  const {user, pass} = await req.json().catch(()=>({}));
  if(verifyAdmin(String(user||""), String(pass||""))){
    const res = NextResponse.json({ok:true, user: readAdmin().user});
    res.cookies.set("mashudi_admin", "mashudi-admin-v1", {path:"/", maxAge:60*60*24*7});
    return res;
  }
  return NextResponse.json({error:"User/pass salah"}, {status:401});
}
export async function PUT(req: NextRequest){
  const token = req.cookies.get("mashudi_admin")?.value;
  if(!isValidToken(token)) return NextResponse.json({error:"Unauthorized - login dulu"}, {status:401});
  const {currentPass, newUser, newPass, confirmPass} = await req.json().catch(()=>({}));
  const cur = readAdmin();
  if(!verifyAdmin(cur.user, String(currentPass||""))) return NextResponse.json({error:"Password lama salah"}, {status:400});
  if(!newPass || String(newPass).length<6) return NextResponse.json({error:"Password baru min 6 karakter"}, {status:400});
  if(newPass!==confirmPass) return NextResponse.json({error:"Konfirmasi password tidak cocok"}, {status:400});
  const user = String(newUser||cur.user).trim() || cur.user;
  updateAdmin(user, String(newPass));
  const res = NextResponse.json({ok:true, user});
  res.cookies.set("mashudi_admin", "mashudi-admin-v1", {path:"/", maxAge:60*60*24*7});
  return res;
}
export async function DELETE(){
  const res = NextResponse.json({ok:true});
  res.cookies.set("mashudi_admin","",{path:"/", maxAge:0});
  return res;
}
export async function GET(req: NextRequest){
  const token = req.cookies.get("mashudi_admin")?.value;
  if(!isValidToken(token)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  return NextResponse.json({user: readAdmin().user});
}
