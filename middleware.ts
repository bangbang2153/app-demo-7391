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

  // ponytail: /invoice & /api/invoice/upload pakai auth yang sama biar pw sinkron sama admin
  const isInvoicePage = path === "/invoice" || path.startsWith("/invoice/");
  const isPublicInvoiceAsset = path.startsWith("/invoice/css/") || path.startsWith("/invoice/js/");
  if(isInvoicePage && !isPublicInvoiceAsset){
    const tok = req.cookies.get("mashudi_admin")?.value;
    const stok = req.cookies.get("mashudi_super")?.value;
    const ok = tok === "mashudi-admin-v1" || stok === (process.env.SUPERADMIN_TOKEN || "mashudi-super-v1-acak");
    if(!ok){
      // redirect ke path admin rahasia biar gak bocorin /admin
      const loginUrl = new URL(`/${adminPath}`, req.url);
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }
  }
  if(path.startsWith("/api/invoice/")){
    // state boleh read public (biar cek logo), tapi upload/reset wajib login
    if(path.includes("/upload")){
      const tok = req.cookies.get("mashudi_admin")?.value;
      const stok = req.cookies.get("mashudi_super")?.value;
      const ok = tok === "mashudi-admin-v1" || stok === (process.env.SUPERADMIN_TOKEN || "mashudi-super-v1-acak");
      if(!ok) return NextResponse.json({error:"Unauthorized - login admin dulu"}, {status:401});
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/mashudi", "/mashudi/:path*", "/mashudi-1787", "/mashudi-1787/:path*", "/api/mashudi/:path*", "/api/mashudi-1787/:path*", "/invoice", "/invoice/:path*", "/api/invoice/:path*"] };
