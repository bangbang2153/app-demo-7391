import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(req: NextRequest){
  const path = req.nextUrl.pathname;
  // Lindungi API admin — butuh cookie login
  if(path.startsWith("/api/admin") && !path.startsWith("/api/admin/login")){
    const token = req.cookies.get("mashudi_admin")?.value;
    if(token !== "mashudi-admin-v1"){
      return NextResponse.json({error:"Unauthorized - login admin dulu"}, {status:401});
    }
  }
  // Halaman /admin biarkan lewat — client akan show login form jika belum auth
  return NextResponse.next();
}
export const config = { matcher: ["/api/admin/:path*"] };
