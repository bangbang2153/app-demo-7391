import { NextRequest, NextResponse } from "next/server";
export const dynamic='force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";
function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }
export async function PUT(req: NextRequest, {params}:{params:{id:string}}){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const b=await req.json();
  try{
    const cur=await prisma.blogPost.findUnique({where:{id:params.id}});
    if(!cur) return NextResponse.json({error:"Not found"},{status:404});
    const up=await prisma.blogPost.update({where:{id:params.id}, data:{
      title:b.title??cur.title, excerpt:b.excerpt??cur.excerpt, content:b.content??cur.content, cover:b.cover??cur.cover,
      author:b.author??cur.author, tags: b.tags? (Array.isArray(b.tags)? b.tags : String(b.tags).split(",").map((s:string)=>s.trim()).filter(Boolean)) : undefined,
      category:b.category??cur.category, published:b.published??cur.published, slug:b.slug??cur.slug
    }});
    return NextResponse.json(up);
  }catch(e:any){return NextResponse.json({error:e.message},{status:500});}
}
export async function DELETE(req: NextRequest, {params}:{params:{id:string}}){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  try{ await prisma.blogPost.delete({where:{id:params.id}}); return NextResponse.json({ok:true});}catch(e:any){return NextResponse.json({error:e.message},{status:404});}
}
