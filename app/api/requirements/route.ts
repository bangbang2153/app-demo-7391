import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export async function GET(){
  try{
    const g = await prisma.globalRequirements.findUnique({where:{id:"global"}});
    return NextResponse.json(g || {id:"global", items:["KTP","SIM A","Deposit / Jaminan"]});
  }catch(e:any){ return NextResponse.json({id:"global", items:["KTP","SIM A","Deposit / Jaminan"]}); }
}
