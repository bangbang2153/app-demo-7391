import { NextRequest, NextResponse } from "next/server";
export const dynamic='force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";
function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }
export async function PUT(req: NextRequest, {params}:{params:{id:string}}){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const b=await req.json();
  try{
    const cur=await prisma.banner.findUnique({where:{id:params.id}});
    if(!cur) return NextResponse.json({error:"Not found"},{status:404});
    const up=await prisma.banner.update({where:{id:params.id}, data:{
      title:b.title??cur.title, subtitle:b.subtitle??cur.subtitle, image:b.image??cur.image,
      ctaText:b.ctaText??cur.ctaText, ctaLink:b.ctaLink??cur.ctaLink, aspect:b.aspect??cur.aspect, active:b.active??cur.active, position:b.position??cur.position
    }});
    return NextResponse.json(up);
  }catch(e:any){return NextResponse.json({error:e.message},{status:500});}
}
export async function DELETE(req: NextRequest, {params}:{params:{id:string}}){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  try{ await prisma.banner.delete({where:{id:params.id}}); return NextResponse.json({ok:true});}catch(e:any){return NextResponse.json({error:e.message},{status:404});}
}
