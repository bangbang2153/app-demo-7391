import { NextRequest, NextResponse } from "next/server";
export const dynamic='force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";
function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }
export async function GET(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  try{ const b=await prisma.banner.findMany({orderBy:{createdAt:"desc"}}); return NextResponse.json(b);}catch(e:any){return NextResponse.json({error:e.message},{status:500});}
}
export async function POST(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await req.json();
  try{
    const banner=await prisma.banner.create({data:{
      title:String(body.title||"Promo Rental"), subtitle:String(body.subtitle||""),
      image:String(body.image||"/images/banner-rental.jpg"), ctaText:String(body.ctaText||"Sewa Sekarang"),
      ctaLink:String(body.ctaLink||"/#katalog"), aspect:String(body.aspect||"16/9"),
      active: body.active!==false, position: String(body.position||"popup")
    }});
    return NextResponse.json(banner);
  }catch(e:any){return NextResponse.json({error:e.message},{status:500});}
}
