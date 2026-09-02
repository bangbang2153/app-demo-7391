import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main(){
  const defaults = ["KTP","SIM A","Deposit / Jaminan"];
  await p.globalRequirements.upsert({where:{id:"global"}, update:{items: defaults}, create:{id:"global", items: defaults}});
  const cars = await p.car.findMany();
  for(const c of cars){
    if(!c.requirements || c.requirements.length===0){
      await p.car.update({where:{id:c.id}, data:{requirements: defaults}});
    }
  }
  console.log("seed req done", (await p.car.count()), (await p.globalRequirements.findUnique({where:{id:"global"}})).items);
}
main().catch(e=>{console.error(e); process.exit(1)}).finally(()=>p.$disconnect());
