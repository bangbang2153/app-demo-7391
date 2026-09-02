import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";
function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }

export async function GET(){
  try{
    const g = await prisma.globalRequirements.findUnique({where:{id:"global"}});
    return NextResponse.json(g || {id:"global", items:["KTP","SIM A","Deposit / Jaminan"]});
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}

export async function PUT(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  const body = await req.json();
  // bulk apply: { items: ["KTP",..], applyToAll?: boolean, carId?: string, requirements?: string[] }
  try{
    if(body.applyToAll && Array.isArray(body.items)){
      const items = body.items.map((s:string)=>s.trim()).filter(Boolean);
      await prisma.globalRequirements.upsert({where:{id:"global"}, update:{items}, create:{id:"global", items}});
      await prisma.car.updateMany({data:{requirements: items}});
      return NextResponse.json({ok:true, items, mode:"bulk-all"});
    }
    if(body.carId && Array.isArray(body.requirements)){
      const reqs = body.requirements.map((s:string)=>s.trim()).filter(Boolean);
      const updated = await prisma.car.update({where:{id: body.carId}, data:{requirements: reqs}});
      return NextResponse.json(updated);
    }
    if(Array.isArray(body.items)){
      const items = body.items.map((s:string)=>s.trim()).filter(Boolean);
      const up = await prisma.globalRequirements.upsert({where:{id:"global"}, update:{items}, create:{id:"global", items}});
      return NextResponse.json(up);
    }
    return NextResponse.json({error:"payload items/requirements wajib"}, {status:400});
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}
