import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest){
  const url = req.nextUrl;
  const path = url.pathname;

  // 1.A: Hilangkan /mashudi & /mashudi-1787 total -> 404, hanya /admin yang hidup
  // ponytail: alias dimatikan, kalau nanti mau path acak lagi tinggal balikkan rewrite via ADMIN_PATH
  if(path === "/mashudi" || path.startsWith("/mashudi/") || path === "/mashudi-1787" || path.startsWith("/mashudi-1787/") || path === "/api/mashudi" || path.startsWith("/api/mashudi/") || path === "/api/mashudi-1787" || path.startsWith("/api/mashudi-1787/")){
    return new NextResponse("Not Found", {status:404});
  }

  // Lindungi API admin — butuh cookie login (admin atau super)
  if(path.startsWith("/api/admin") && !path.startsWith("/api/admin/login")){
    const token = req.cookies.get("mashudi_admin")?.value;
    const superTok = req.cookies.get("mashudi_super")?.value;
    const ok = token === "mashudi-admin-v1" || superTok === (process.env.SUPERADMIN_TOKEN || "mashudi-super-v1-acak");
    if(!ok){
      return NextResponse.json({error:"Unauthorized - login admin dulu"}, {status:401});
    }
  }

  // 2.B: /invoice & /api/invoice/upload tetap pakai pw admin yang sama, tapi JANGAN redirect di middleware
  //     biar /invoice bisa render form login kecil di page itu sendiri (sinkron pw).
  //     Middleware hanya jaga API upload, page dibiarkan lewat -> page.tsx yang cek auth & tampilkan login inline.
  if(path.startsWith("/api/invoice/") && path.includes("/upload")){
    const tok = req.cookies.get("mashudi_admin")?.value;
    const stok = req.cookies.get("mashudi_super")?.value;
    const ok = tok === "mashudi-admin-v1" || stok === (process.env.SUPERADMIN_TOKEN || "mashudi-super-v1-acak");
    if(!ok) return NextResponse.json({error:"Unauthorized - login admin dulu"}, {status:401});
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/mashudi", "/mashudi/:path*", "/mashudi-1787", "/mashudi-1787/:path*", "/api/mashudi/:path*", "/api/mashudi-1787/:path*", "/invoice", "/invoice/:path*", "/api/invoice/:path*"] };
