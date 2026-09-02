import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { readCars } from "@/lib/carsStore";
export async function GET(){
  try{
    const cars = await prisma.car.findMany({orderBy:{pricePerDay:"asc"}});
    return NextResponse.json(cars);
  }catch(e:any){
    // fallback file
    return NextResponse.json(readCars());
  }
}
