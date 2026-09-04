import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isOverlapping } from "@/lib/availability";
export const dynamic = 'force-dynamic';

const schema = z.object({
  carId: z.string().min(1),
  carSlug: z.string().optional(),
  start: z.string().min(1),
  end: z.string().min(1),
  mode: z.enum(["LEPAS_KUNCI","DENGAN_SUPIR"]),
  name: z.string().min(2),
  wa: z.string().min(8),
  total: z.number().optional(),
  payOption: z.string().optional(),
});

export async function GET(){
  try{
    const data = await prisma.booking.findMany({orderBy:{createdAt:"desc"}, include:{car:true}});
    const mapped = data.map(b=>({
      id:b.id, carId:b.carId, carName:b.car.name, name:b.name, wa:b.wa, email:b.email,
      start:b.startDate.toISOString().slice(0,10), end:b.endDate.toISOString().slice(0,10),
      mode:b.mode, total:b.total, payOption:b.payMethod||b.payStatus, status:b.status, payStatus:b.payStatus, proofUrl:b.proofUrl, createdAt:b.createdAt.toISOString()
    }));
    return NextResponse.json(mapped);
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}

export async function POST(req: NextRequest){
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:"Data tidak valid", details: parsed.error.flatten()}, {status:400});
  const {carId, start, end, mode, name, wa, total, payOption} = parsed.data as any;
  const carSlug = body.carSlug || carId;
  const s = new Date(start); const e = new Date(end);
  if(isNaN(s.getTime())||isNaN(e.getTime())|| e <= s) return NextResponse.json({error:"Tanggal tidak valid"}, {status:400});
  try{
    let car = await prisma.car.findFirst({where:{OR:[{id:carId},{slug:carSlug}]}});
    if(!car) return NextResponse.json({error:"Mobil tidak ditemukan"}, {status:404});
    const existing = await prisma.booking.findMany({where:{carId:car.id, status:{in:["pending","paid","confirmed","dp_paid"]}}});
    const clash = existing.some(b=> isOverlapping(start,end, b.startDate.toISOString().slice(0,10), b.endDate.toISOString().slice(0,10)));
    if(clash) return NextResponse.json({error:"Tanggal bentrok — mobil sudah dibooking di rentang itu. Coba tanggal lain atau Nego WA 0822-8690-6897"},{status:409});
    const booking = await prisma.booking.create({
      data:{
        carId:car.id, name, wa, startDate:s, endDate:e, mode, total: Number(total||0),
        payMethod: payOption||"TRANSFER", payStatus:"pending", status:"pending"
      }
    });
    return NextResponse.json({id:booking.id, carId:car.id, carName:car.name, name, wa, start, end, mode, total: booking.total, payOption, status:"pending", createdAt: booking.createdAt.toISOString()});
  }catch(err:any){ return NextResponse.json({error:err.message},{status:500}); }
}
