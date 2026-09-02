export type Booking = { carId:string; startDate:string; endDate:string; status:string };
// ponytail: in-memory check, upgrade to DB exclusion constraint when PG ready
export function isOverlapping(aStart:string, aEnd:string, bStart:string, bEnd:string){
  const s1=new Date(aStart).getTime(), e1=new Date(aEnd).getTime(), s2=new Date(bStart).getTime(), e2=new Date(bEnd).getTime();
  return !(e1 <= s2 || s1 >= e2); // end==start allowed
}
export function isAvailable(carId:string, start:string, end:string, bookings:Booking[]){
  const blocked = bookings.filter(b=>b.carId===carId && ["paid","confirmed","dp_paid"].includes(b.status));
  return !blocked.some(b=>isOverlapping(start,end,b.startDate,b.endDate));
}
