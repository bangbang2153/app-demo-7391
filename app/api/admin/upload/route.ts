import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs"; import * as path from "path";
import { isValidToken } from "@/lib/adminAuth";

export async function POST(req: NextRequest){
  const token = req.cookies.get("mashudi_admin")?.value;
  if(!isValidToken(token)) return NextResponse.json({error:"Unauthorized - login admin dulu"}, {status:401});
  let form: FormData;
  try { form = await req.formData(); } catch(e:any){ return NextResponse.json({error:"FormData gagal: "+e.message},{status:400});}
  const file = form.get("file") as File | null;
  if(!file) return NextResponse.json({error:"File wajib"}, {status:400});
  if(file.size > 5*1024*1024) return NextResponse.json({error:"Max 5MB"}, {status:400});
  const allowed = ["image/jpeg","image/png","image/webp","image/jpg"];
  if(!allowed.includes(file.type) && !file.type.startsWith("image/")) return NextResponse.json({error:"Hanya jpg/png/webp (dapat: "+file.type+")"}, {status:400});
  let buf: Buffer;
  try { buf = Buffer.from(await file.arrayBuffer()); } catch(e:any){ return NextResponse.json({error:"Gagal baca file"}, {status:400});}
  const extRaw = (file.name.split(".").pop() || "jpg").toLowerCase();
  const ext = extRaw.replace(/[^a-z0-9]/g,"").slice(0,4) || "jpg";
  const safeExt = ["jpg","jpeg","png","webp"].includes(ext) ? ext : "jpg";
  const name = Date.now().toString(36)+Math.random().toString(36).slice(2,6)+"."+safeExt;

  // Supabase Storage via REST (no SDK needed — works on Vercel + local)
  const supaUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/,"");
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
  if(supaUrl && supaKey){
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "images";
    try{
      const uploadUrl = `${supaUrl}/storage/v1/object/${bucket}/${name}`;
      const r = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "apikey": supaKey,
          "Authorization": `Bearer ${supaKey}`,
          "Content-Type": file.type || "image/jpeg",
          "x-upsert": "false",
        },
        body: buf as any,
      });
      if(!r.ok){
        const txt = await r.text().catch(()=> "");
        throw new Error(`${r.status} ${txt.slice(0,300)}`);
      }
      const publicUrl = `${supaUrl}/storage/v1/object/public/${bucket}/${name}`;
      return NextResponse.json({url: publicUrl, storage: "supabase", bucket});
    }catch(e:any){
      if(process.env.VERCEL){
        return NextResponse.json({error:"Upload Supabase gagal: "+e.message+" — cek SUPABASE_URL/KEY & bucket '"+bucket+"' public di Supabase Storage."}, {status:500});
      }
      // local fallback to FS
    }
  }

  try{
    const dir = path.join(process.cwd(), "public/images");
    fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,name), buf);
    return NextResponse.json({url: `/images/${name}`, storage: "local"});
  }catch(e:any){
    const hint = (e.code==="EROFS" || String(e.message).includes("read-only"))
      ? " — Vercel filesystem read-only. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY di Vercel Env + buat bucket 'images' public."
      : "";
    return NextResponse.json({error:"Gagal simpan file: "+e.message+hint}, {status:500});
  }
}
