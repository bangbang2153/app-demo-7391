import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";
import * as fs from "fs"; import * as path from "path";
function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }
export async function PUT(req: NextRequest, {params}:{params:{id:string}}){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  const body = await req.json();
  const id = params.id || body.id;
  if(!id) return NextResponse.json({error:"id wajib"}, {status:400});
  try{
    const cur = await prisma.car.findUnique({where:{id}});
    if(!cur) return NextResponse.json({error:"Mobil tidak ditemukan"}, {status:404});
    const newImages: string[] | undefined = Array.isArray(body.images) ? body.images.filter((s:string)=> typeof s==="string" && s.trim().length>0) : undefined;
    const removed: string[] = newImages ? cur.images.filter(url => url && !newImages.includes(url)) : [];
    const updated = await prisma.car.update({
      where:{id},
      data:{
        name: body.name ?? cur.name,
        category: body.category ?? cur.category,
        transmission: body.transmission ?? cur.transmission,
        seats: body.seats!=null? Number(body.seats): cur.seats,
        pricePerDay: body.pricePerDay!=null? Number(body.pricePerDay): cur.pricePerDay,
        driverFeePerDay: body.driverFeePerDay!=null? Number(body.driverFeePerDay): cur.driverFeePerDay,
        qty: body.qty!=null? Number(body.qty): cur.qty,
        images: newImages !== undefined ? newImages : undefined,
        features: Array.isArray(body.features)? body.features : (body.features? String(body.features).split(",").map((s:string)=>s.trim()).filter(Boolean): undefined),
        requirements: Array.isArray(body.requirements)? body.requirements : (body.requirements!=null? String(body.requirements).split(",").map((s:string)=>s.trim()).filter(Boolean): undefined),
        status: body.status ?? cur.status,
        slug: body.slug ?? cur.slug,
      }
    });
    // cleanup storage file fisik yang dihapus — jangan block response kalau gagal
    if(removed.length){
      // cek apakah gambar masih dipakai mobil lain — kalau iya jangan hapus fisik
      let otherCars: {images:string[]}[] = [];
      try{ otherCars = await prisma.car.findMany({where:{id:{not:id}}, select:{images:true}});}catch{}
      const stillUsed = new Set(otherCars.flatMap(c=> c.images));
      const toDelete = removed.filter(u => !stillUsed.has(u));
      for(const url of toDelete){
        try{
          // case 1: local /images/xxx
          if(url.startsWith("/images/")){
            const file = path.join(process.cwd(), "public", url);
            // cegah path traversal
            const base = path.join(process.cwd(), "public/images");
            const resolved = path.resolve(file);
            if(resolved.startsWith(path.resolve(base)) && fs.existsSync(resolved)){
              fs.unlinkSync(resolved);
            }
          } else if(url.includes("/storage/v1/object/")){
            // case 2: supabase public url  https://xxx.supabase.co/storage/v1/object/public/<bucket>/<name>
            // atau private supabase storage url
            const supaUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/,"");
            const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
            if(supaUrl && supaKey && url.startsWith(supaUrl)){
              // extract bucket + name from url
              const m = url.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/) || url.match(/\/storage\/v1\/object\/([^\/]+)\/(.+)$/);
              if(m){
                const bucket = m[1]; const name = m[2].split("?")[0];
                await fetch(`${supaUrl}/storage/v1/object/${bucket}/${name}`, {
                  method: "DELETE",
                  headers: { "apikey": supaKey, "Authorization": `Bearer ${supaKey}` },
                }).catch(()=>{});
              }
            }
          }
        }catch{}
      }
    }
    return NextResponse.json(updated);
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}
export async function DELETE(req: NextRequest, {params}:{params:{id:string}}){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  const id = params.id;
  if(!id) return NextResponse.json({error:"id wajib"}, {status:400});
  try{ await prisma.car.delete({where:{id}}); return NextResponse.json({ok:true}); }catch(e:any){ return NextResponse.json({error:e.message},{status:404}); }
}
