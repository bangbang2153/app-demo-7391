import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getAdminPath(){
  const p = (process.env.ADMIN_PATH || "mashudi").replace(/^\/+|\/+$/g,"");
  return p || "mashudi";
}

export function middleware(req: NextRequest){
  const url = req.nextUrl;
  const path = url.pathname;
  const adminPath = getAdminPath();
  const adminPathFull = `/${adminPath}`;
  const apiAdminPath = `/api/${adminPath}`;

  // Rewrite /<ADMIN_PATH> -> /admin  dan  /api/<ADMIN_PATH> -> /api/admin
  // (keep /admin tetap bisa diakses juga biar gak lockout — obscurity via tidak dipublish, bukan 404 hard)
  // ponytail: kalau mau /admin jadi 404, pindah check ke app/admin/page.tsx via notFound() biar rewrite tidak ke-block
  if(adminPath !== "admin"){
    if(path === adminPathFull || path.startsWith(adminPathFull + "/")){
      const rest = path.slice(adminPathFull.length) || "";
      const dest = "/admin" + rest + url.search;
      return NextResponse.rewrite(new URL(dest, req.url));
    }
    if(path === apiAdminPath || path.startsWith(apiAdminPath + "/")){
      const rest = path.slice(apiAdminPath.length) || "";
      const dest = "/api/admin" + rest + url.search;
      return NextResponse.rewrite(new URL(dest, req.url));
    }
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
  return NextResponse.next();
}
export const config = { matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/mashudi", "/mashudi/:path*", "/mashudi-1787", "/mashudi-1787/:path*", "/api/mashudi/:path*", "/api/mashudi-1787/:path*"] };
