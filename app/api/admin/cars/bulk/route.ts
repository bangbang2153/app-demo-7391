import { NextRequest, NextResponse } from "next/server";
export const dynamic='force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";
function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }

export async function POST(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const body = await req.json().catch(()=>null);
  if(!body) return NextResponse.json({error:"JSON tidak valid"}, {status:400});
  const raw: any[] = Array.isArray(body) ? body : (Array.isArray(body.cars) ? body.cars : Array.isArray(body.data) ? body.data : []);
  if(!raw.length) return NextResponse.json({error:"Kirim array JSON, contoh: [{\"name\":\"Avanza\"}, ...] atau {\"cars\":[...]}"}, {status:400});
  if(raw.length > 50) return NextResponse.json({error:"Maks 50 mobil per bulk"}, {status:400});
  const created: any[] = [];
  const skipped: any[] = [];
  for(let i=0;i<raw.length;i++){
    const r = raw[i];
    const name = String(r.name||r.nama||"").trim();
    if(!name){ skipped.push({index:i, reason:"name wajib"}); continue; }
    const slugBase = (r.slug || name).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "mobil";
    const id = Date.now().toString(36)+Math.random().toString(36).slice(2,5)+i;
    const slug = slugBase + "-" + id.slice(0,4);
    try{
      const car = await prisma.car.create({
        data:{
          slug,
          name,
          category: String(r.category||r.kategori||"MPV").toUpperCase(),
          transmission: String(r.transmission||r.transmisi||"AT").toUpperCase(),
          seats: Number(r.seats||r.kursi||7),
          pricePerDay: Number(r.pricePerDay||r.harga||350000),
          driverFeePerDay: Number(r.driverFeePerDay||r.supir||150000),
          qty: Number(r.qty||r.stok||1),
          images: Array.isArray(r.images)&&r.images.length ? r.images : (r.image ? [r.image] : ["/images/avanza-2023.jpg"]),
          features: Array.isArray(r.features) ? r.features : String(r.features||"AC, Audio").split(",").map((s:string)=>s.trim()).filter(Boolean),
          requirements: Array.isArray(r.requirements) ? r.requirements : String(r.requirements||"KTP, SIM A, Deposit").split(",").map((s:string)=>s.trim()).filter(Boolean),
          status: r.status||"active"
        }
      });
      created.push(car);
    }catch(e:any){ skipped.push({index:i, name, error:e.message}); }
  }
  return NextResponse.json({ok:true, created: created.length, skipped, cars: created});
}
