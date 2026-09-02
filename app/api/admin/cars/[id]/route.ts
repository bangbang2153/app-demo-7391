import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";
function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }
export async function PUT(req: NextRequest, {params}:{params:{id:string}}){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  const body = await req.json();
  const id = params.id || body.id;
  if(!id) return NextResponse.json({error:"id wajib"}, {status:400});
  try{
    const cur = await prisma.car.findUnique({where:{id}});
    if(!cur) return NextResponse.json({error:"Mobil tidak ditemukan"}, {status:404});
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
        images: Array.isArray(body.images)&&body.images.length? body.images : undefined,
        features: Array.isArray(body.features)? body.features : (body.features? String(body.features).split(",").map((s:string)=>s.trim()).filter(Boolean): undefined),
        requirements: Array.isArray(body.requirements)? body.requirements : (body.requirements!=null? String(body.requirements).split(",").map((s:string)=>s.trim()).filter(Boolean): undefined),
        status: body.status ?? cur.status,
        slug: body.slug ?? cur.slug,
      }
    });
    return NextResponse.json(updated);
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}
export async function DELETE(req: NextRequest, {params}:{params:{id:string}}){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  const id = params.id;
  if(!id) return NextResponse.json({error:"id wajib"}, {status:400});
  try{ await prisma.car.delete({where:{id}}); return NextResponse.json({ok:true}); }catch(e:any){ return NextResponse.json({error:e.message},{status:404}); }
}
