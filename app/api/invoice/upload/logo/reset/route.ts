import { NextResponse } from "next/server";
import * as fs from "fs"; import * as path from "path";
export const dynamic = 'force-dynamic';
export async function POST(){
  try{
    const supaUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/,"");
    const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const dir = path.join(process.cwd(), "public/invoice/uploads");
    if(supaUrl && supaKey){
      // try delete supabase first, then local
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || "images";
      // list via API? just try delete common ext
      for(const ext of ["png","jpg","jpeg","webp"]){
        await fetch(`${supaUrl}/storage/v1/object/${bucket}/logo-custom.${ext}`, {
          method:"DELETE",
          headers:{ "apikey": supaKey, "Authorization": `Bearer ${supaKey}` },
        }).catch(()=>{});
      }
    }
    if(fs.existsSync(dir)){
      for(const f of fs.readdirSync(dir)) if(f.startsWith("logo-custom")) fs.unlinkSync(path.join(dir,f));
    }
    return NextResponse.json({ok:true});
  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500});
  }
}
