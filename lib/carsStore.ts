import * as fs from "fs"; import * as path from "path";
import { cars as seedCars, type Car } from "./cars";
const file = path.join(process.cwd(), "data/cars.json");
export function readCars(): Car[] {
  try {
    if(fs.existsSync(file)){
      const raw = fs.readFileSync(file,"utf-8");
      const parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length>0) return parsed;
    }
  }catch{}
  try{ fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file, JSON.stringify(seedCars,null,2)); }catch{}
  return seedCars;
}
export function writeCars(cars: Car[]){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file, JSON.stringify(cars,null,2));
}
export function getCarBySlug(slug:string){ return readCars().find(c=>c.slug===slug); }
export function getCarById(id:string){ return readCars().find(c=>c.id===id); }
