import { NextResponse } from "next/server";
export const dynamic='force-dynamic';
import { prisma } from "@/lib/prisma";
export async function GET(){
  try{
    const posts = await prisma.blogPost.findMany({where:{published:true}, orderBy:{createdAt:"desc"}});
    return NextResponse.json(posts);
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}
