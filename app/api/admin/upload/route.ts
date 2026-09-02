import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs"; import * as path from "path";
import { isValidToken } from "@/lib/adminAuth";

export async function POST(req: NextRequest){
  const token = req.cookies.get("mashudi_admin")?.value;
  if(!isValidToken(token)) return NextResponse.json({error:"Unauthorized"}, {status:401});
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if(!file) return NextResponse.json({error:"File wajib"}, {status:400});
  if(file.size > 5*1024*1024) return NextResponse.json({error:"Max 5MB"}, {status:400});
  const allowed = ["image/jpeg","image/png","image/webp","image/jpg"];
  if(!allowed.includes(file.type)) return NextResponse.json({error:"Hanya jpg/png/webp"}, {status:400});
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "jpg";
  const name = Date.now().toString(36)+Math.random().toString(36).slice(2,6)+"."+ext.replace(/[^a-z0-9]/gi,"");
  const dir = path.join(process.cwd(), "public/images");
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,name), buf);
  // bukti transfer simpan di public/uploads
  const publicUrl = `/images/${name}`;
  return NextResponse.json({url: publicUrl});
}
