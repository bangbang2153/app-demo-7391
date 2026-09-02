import * as fs from "fs"; import * as path from "path";
export type StoredBooking = {
  id:string; carId:string; carName:string; name:string; wa:string; email?:string;
  start:string; end:string; mode:string; total:number; payOption:string; status:string; createdAt:string;
  payStatus?:string; proofUrl?:string; payMethod?:string;
};
const file = path.join(process.cwd(), "data/bookings.json");
export function readBookings(): StoredBooking[]{
  try{ return JSON.parse(fs.readFileSync(file,"utf-8")); }catch{ return []; }
}
export function writeBookings(b: StoredBooking[]){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file, JSON.stringify(b,null,2));
}
