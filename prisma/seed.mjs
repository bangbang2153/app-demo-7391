import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

async function main(){
  const carsFile = path.join(process.cwd(), "data/cars.json");
  const bookingsFile = path.join(process.cwd(), "data/bookings.json");
  let cars = [];
  try{ cars = JSON.parse(fs.readFileSync(carsFile,"utf-8")); }catch{ 
    // fallback to lib/cars.ts seed
    cars = [
      {id:"1", slug:"avanza-2023", name:"Toyota Avanza 2023", category:"MPV", transmission:"AT", seats:7, pricePerDay:350000, driverFeePerDay:150000, qty:2, images:["/images/avanza-2023.jpg"], features:["AC Double Blower","Audio Bluetooth","Bagasi Luas"], status:"active"},
    ];
  }
  console.log("Seeding", cars.length, "cars");
  for(const c of cars){
    await prisma.car.upsert({
      where:{slug:c.slug},
      update:{name:c.name, category:c.category, transmission:c.transmission, seats:c.seats, pricePerDay:c.pricePerDay, driverFeePerDay:c.driverFeePerDay||150000, qty:c.qty||1, images:c.images||["/images/avanza-2023.jpg"], features:c.features||[], status:c.status||"active"},
      create:{id:c.id, slug:c.slug, name:c.name, category:c.category, transmission:c.transmission, seats:c.seats, pricePerDay:c.pricePerDay, driverFeePerDay:c.driverFeePerDay||150000, qty:c.qty||1, images:c.images||["/images/avanza-2023.jpg"], features:c.features||[], status:c.status||"active"},
    });
  }
  let bookings=[];
  try{ bookings=JSON.parse(fs.readFileSync(bookingsFile,"utf-8")); }catch{}
  console.log("Seeding", bookings.length, "bookings");
  const carMap = new Map((await prisma.car.findMany()).map(c=>[c.slug, c.id]));
  // also map by id
  const carById = new Map((await prisma.car.findMany()).map(c=>[c.id, c.id]));
  for(const b of bookings){
    let carId = b.carId;
    if(!carById.has(carId) && carMap.has(b.carName)) carId = carMap.get(b.carName);
    if(!carId || !carById.has(carId)) { console.log("skip booking no car", b.id); continue; }
    await prisma.booking.upsert({
      where:{id:b.id},
      update:{status:b.status||"pending", payStatus: b.payStatus||b.status||"pending", total:b.total||0},
      create:{
        id:b.id,
        carId,
        name:b.name, wa:b.wa,
        startDate: new Date(b.start),
        endDate: new Date(b.end),
        mode:b.mode||"LEPAS_KUNCI",
        total:b.total||0,
        payMethod:b.payOption||b.payMethod||"TRANSFER",
        payStatus:b.payStatus||b.status||"pending",
        status:b.status||"pending",
        proofUrl:b.proofUrl||null,
      }
    });
  }
  const cntCars = await prisma.car.count();
  const cntB = await prisma.booking.count();
  console.log("DONE cars",cntCars,"bookings",cntB);
}
main().catch(e=>{console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect());
