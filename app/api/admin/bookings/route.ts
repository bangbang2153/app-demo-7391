import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";
function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }
export async function GET(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"}, {status:401});
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
