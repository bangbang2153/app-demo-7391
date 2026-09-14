import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs"; import * as path from "path";
export const dynamic = 'force-dynamic';

function uploadsDir(){
  return path.join(process.cwd(), "public/invoice/uploads");
}

export async function GET(){
  try{
    const dir = uploadsDir();
    const defaultLogo = fs.existsSync(path.join(dir, "logo-default.png")) ? "/invoice/uploads/logo-default.png" : (fs.existsSync(path.join(process.cwd(),"public/invoice/logo-default.png")) ? "/invoice/logo-default.png" : null);
    let customLogo: string | null = null;
    let stamp: string | null = null;
    if(fs.existsSync(dir)){
      const files = fs.readdirSync(dir);
      const c = files.find(f=> f.startsWith("logo-custom"));
      if(c) customLogo = "/invoice/uploads/" + c;
      const s = files.find(f=> f.startsWith("stamp"));
      if(s) stamp = "/invoice/uploads/" + s;
    }
    // also check supabase public urls? For Vercel, we store supabase URLs but not needed for state
    return NextResponse.json({ defaultLogo, customLogo, stamp });
  }catch(e:any){
    return NextResponse.json({ defaultLogo: "/invoice/logo-default.png", customLogo: null, stamp: null });
  }
}
