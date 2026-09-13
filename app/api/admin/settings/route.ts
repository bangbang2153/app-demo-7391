import { NextRequest, NextResponse } from "next/server";
export const dynamic='force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";
import { sanitizeWaTemplate } from "@/lib/waTemplate";
function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }

export async function GET(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized - login admin dulu"},{status:401});
  try{
    const s = await prisma.appSettings.findUnique({where:{id:"global"}});
    return NextResponse.json(s || {id:"global", waNumber:"6282286906897", waTemplate:"Halo Mashudi Transport, mau sewa (car) tgl (start) s/d (end) (mode). Total Rp (total). Bisa nego?"});
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}

export async function PUT(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized - login admin dulu"},{status:401});
  const {waNumber, waTemplate} = await req.json().catch(()=>({}));
  try{
    const clean = String(waNumber||"").replace(/[^0-9]/g,"");
    if(clean.length < 10) return NextResponse.json({error:"No WA minimal 10 digit"}, {status:400});
    const safe = sanitizeWaTemplate(String(waTemplate||""));
    if(safe.length < 10) return NextResponse.json({error:"Template WA wajib (min 10 karakter, gunakan (car) (start) (end) (mode) (total))"}, {status:400});
    const up = await prisma.appSettings.upsert({
      where:{id:"global"},
      update:{waNumber: clean, waTemplate: safe},
      create:{id:"global", waNumber: clean, waTemplate: safe}
    });
    return NextResponse.json(up);
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}
