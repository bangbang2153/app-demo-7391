import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs"; import * as path from "path";
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest){
  try{
    const form = await req.formData();
    const file = form.get("logo") as File | null;
    if(!file) return NextResponse.json({error:"No file"}, {status:400});
    if(file.size > 5*1024*1024) return NextResponse.json({error:"Max 5MB"}, {status:400});
    const allowed = ["image/png","image/jpeg","image/webp","image/jpg"];
    if(!allowed.includes(file.type) && !file.type.startsWith("image/")) return NextResponse.json({error:"Hanya png/jpg/webp"}, {status:400});
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,4) || "png";
    const safeExt = ["png","jpg","jpeg","webp"].includes(ext) ? ext : "png";
    const name = `logo-custom.${safeExt}`;

    // Supabase first (Vercel), fallback local FS
    const supaUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/,"");
    const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
    if(supaUrl && supaKey){
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || "images";
      try{
        const uploadUrl = `${supaUrl}/storage/v1/object/${bucket}/${name}`;
        const r = await fetch(uploadUrl, {
          method: "POST",
          headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}`, "Content-Type": file.type || "image/png", "x-upsert": "true" },
          body: buf as any,
        });
        if(!r.ok){ const txt=await r.text().catch(()=> ""); throw new Error(`${r.status} ${txt.slice(0,300)}`);}
        const publicUrl = `${supaUrl}/storage/v1/object/public/${bucket}/${name}`;
        return NextResponse.json({ url: publicUrl, storage:"supabase" });
      }catch(e:any){
        if(process.env.VERCEL) return NextResponse.json({error:"Supabase upload gagal: "+e.message}, {status:500});
      }
    }
    const dir = path.join(process.cwd(), "public/invoice/uploads");
    fs.mkdirSync(dir,{recursive:true});
    // remove old logo-custom.*
    try{
      for(const f of fs.readdirSync(dir)) if(f.startsWith("logo-custom")) fs.unlinkSync(path.join(dir,f));
    }catch{}
    fs.writeFileSync(path.join(dir, name), buf);
    return NextResponse.json({ url: `/invoice/uploads/${name}`, storage:"local" });
  }catch(e:any){
    return NextResponse.json({error:e.message}, {status:500});
  }
}
