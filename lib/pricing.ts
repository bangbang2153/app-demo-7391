// ponytail: simple daily pricing, add hourly/weekly tiers when needed
export function daysBetween(start: string, end: string){
  const s = new Date(start); const e = new Date(end);
  const diff = Math.ceil((e.getTime() - s.getTime())/86400000);
  return Math.max(1, diff || 1);
}
export function calcTotal(pricePerDay:number, driverFee:number, start:string, end:string, withDriver:boolean){
  const d = daysBetween(start,end);
  return d * pricePerDay + (withDriver ? d * driverFee : 0);
}
