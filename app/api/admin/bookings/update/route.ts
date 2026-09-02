import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";
function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }
export async function PUT(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  const body = await req.json();
  const {id, status, payStatus, proofUrl} = body;
  if(!id) return NextResponse.json({error:"id wajib"}, {status:400});
  try{
    const cur = await prisma.booking.findUnique({where:{id}, include:{car:true}});
    if(!cur) return NextResponse.json({error:"Booking tidak ditemukan"}, {status:404});
    const data:any = {};
    if(status) data.status = status;
    if(payStatus) data.payStatus = payStatus;
    if(proofUrl!==undefined) data.proofUrl = proofUrl;
    if(status==="confirmed"||status==="paid") data.payStatus = status;
    if(status==="cancelled") data.payStatus = "cancelled";
    const updated = await prisma.booking.update({where:{id}, data, include:{car:true}});
    return NextResponse.json({
      id: updated.id, carId: updated.carId, carName: updated.car.name, name: updated.name, wa: updated.wa,
      start: updated.startDate.toISOString().slice(0,10), end: updated.endDate.toISOString().slice(0,10),
      mode: updated.mode, total: updated.total, payOption: updated.payMethod||updated.payStatus, status: updated.status, payStatus: updated.payStatus, proofUrl: updated.proofUrl, createdAt: updated.createdAt.toISOString()
    });
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}
export async function DELETE(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  const { searchParams } = new URL(req.url);
  const body = await req.json().catch(()=>({}));
  const id = searchParams.get("id") || body.id;
  if(!id) return NextResponse.json({error:"id wajib"}, {status:400});
  try{ await prisma.booking.delete({where:{id}}); return NextResponse.json({ok:true}); }catch(e:any){ return NextResponse.json({error:e.message},{status:404}); }
}
