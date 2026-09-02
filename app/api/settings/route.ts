import { NextResponse } from "next/server";
export const dynamic='force-dynamic';
import { prisma } from "@/lib/prisma";
export async function GET(){
  try{
    const s = await prisma.appSettings.findUnique({where:{id:"global"}});
    if(s) return NextResponse.json(s);
    return NextResponse.json({id:"global", waNumber:"6283123768532", waTemplate:"Halo Mashudi Transport, mau sewa (car) tgl (start) s/d (end) (mode). Total Rp (total). Bisa nego?"});
  }catch(e:any){ return NextResponse.json({id:"global", waNumber:"6283123768532", waTemplate:"Halo Mashudi Transport, mau sewa (car) tgl (start) s/d (end) (mode). Total Rp (total). Bisa nego?"}); }
}
