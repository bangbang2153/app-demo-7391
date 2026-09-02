import { NextRequest, NextResponse } from "next/server";
export const dynamic='force-dynamic';
import { prisma } from "@/lib/prisma";
import { isValidToken } from "@/lib/adminAuth";
function needAuth(req: NextRequest){ return isValidToken(req.cookies.get("mashudi_admin")?.value); }
export async function GET(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  try{ const posts=await prisma.blogPost.findMany({orderBy:{createdAt:"desc"}}); return NextResponse.json(posts);}catch(e:any){return NextResponse.json({error:e.message},{status:500});}
}
export async function POST(req: NextRequest){
  if(!needAuth(req)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const b=await req.json();
  try{
    const slug=(b.slug||b.title||"post").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")+"-"+Date.now().toString(36).slice(0,4);
    const post=await prisma.blogPost.create({data:{
      slug, title:String(b.title||"Tanpa Judul"), excerpt:String(b.excerpt||b.title||"").slice(0,160),
      content:String(b.content||"<p>Konten</p>"), cover:String(b.cover||"/images/blog-sate.jpg"),
      author:String(b.author||"MASHUDI Kuliner"), tags: Array.isArray(b.tags)? b.tags : String(b.tags||"kuliner").split(",").map((s:string)=>s.trim()).filter(Boolean),
      category:String(b.category||"Kuliner"), published: b.published!==false
    }});
    return NextResponse.json(post);
  }catch(e:any){return NextResponse.json({error:e.message},{status:500});}
}
