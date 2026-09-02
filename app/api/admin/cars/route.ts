import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";

function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }

export async function GET(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  try{ const cars = await prisma.car.findMany({orderBy:{pricePerDay:"asc"}}); return NextResponse.json(cars); }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}

export async function POST(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  const body = await req.json();
  try{
    const id = Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const slug = (body.slug || body.name || "mobil").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + "-" + id.slice(0,4);
    const car = await prisma.car.create({
      data:{
        slug, name: String(body.name||"Mobil Baru").trim(),
        category: String(body.category||"MPV"), transmission: String(body.transmission||"AT"),
        seats: Number(body.seats||7), pricePerDay: Number(body.pricePerDay||350000),
        driverFeePerDay: Number(body.driverFeePerDay||150000), qty: Number(body.qty||1),
        images: Array.isArray(body.images)&&body.images.length? body.images : (body.image? [body.image]: ["/images/avanza-2023.jpg"]),
        features: Array.isArray(body.features)? body.features : String(body.features||"AC, Audio").split(",").map((s:string)=>s.trim()).filter(Boolean),
        requirements: Array.isArray(body.requirements)? body.requirements : String(body.requirements||"KTP, SIM A, Deposit").split(",").map((s:string)=>s.trim()).filter(Boolean),
        status: body.status||"active"
      }
    });
    return NextResponse.json(car);
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}
