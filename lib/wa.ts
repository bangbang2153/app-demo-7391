export const WA_NUMBER = "6282286906897"; // 082286906897 -> 62
export function waLink(text:string){
  const t = encodeURIComponent(text);
  return `https://wa.me/${WA_NUMBER}?text=${t}`;
}
export function waBookingText(carName:string, start:string, end:string, mode:string, total:number){
  return `Halo Mashudi Transport, mau sewa ${carName} tgl ${start} s/d ${end} (${mode}). Total estimasi Rp ${total.toLocaleString("id-ID")}. Bisa nego?`;
}
