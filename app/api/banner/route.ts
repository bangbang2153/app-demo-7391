import { NextResponse } from "next/server";
export const dynamic='force-dynamic';
import { prisma } from "@/lib/prisma";
export async function GET(){
  try{
    const { searchParams } = new URL(new Request("http://x").url);
  }catch{}
  try{
    const banner = await prisma.banner.findFirst({where:{active:true}, orderBy:{createdAt:"desc"}});
    return NextResponse.json(banner || null);
  }catch(e:any){ return NextResponse.json(null); }
}
