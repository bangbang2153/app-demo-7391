"use client";
import { useState, useMemo, useEffect } from "react";
import type { Car } from "@/lib/cars";
import { calcTotal, daysBetween } from "@/lib/pricing";
import { renderWaTemplate } from "@/lib/waTemplate";

export default function BookingBox({car}:{car:Car}){
  const [start,setStart]=useState("");
  const [end,setEnd]=useState("");
  const [mode,setMode]=useState<"LEPAS_KUNCI"|"DENGAN_SUPIR">("LEPAS_KUNCI");
  const [name,setName]=useState("");
  const [wa,setWa]=useState("");
  const [pay,setPay]=useState<"DP 30%"|"FULL">("DP 30%");
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState("");
  const [waNumber,setWaNumber]=useState("6283123768532");
  const [waTemplate,setWaTemplate]=useState("Halo Mashudi Transport, mau sewa (car) tgl (start) s/d (end) (mode). Total Rp (total). Bisa nego?");
  useEffect(()=>{
    fetch("/api/settings").then(r=>r.json()).then(s=>{
      if(s.waNumber) setWaNumber(s.waNumber);
      if(s.waTemplate) setWaTemplate(s.waTemplate);
    }).catch(()=>{});
  },[]);
  function waLink(){
    const txt = renderWaTemplate(waTemplate, {car: car.name, start: start||"...", end: end||"...", mode, total: total.toLocaleString("id-ID")});
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(txt)}`;
  }

  const days = useMemo(()=> (start&&end ? daysBetween(start,end) : 0), [start,end]);
  const withDriver = mode==="DENGAN_SUPIR";
  const total = useMemo(()=> (start&&end ? calcTotal(car.pricePerDay, car.driverFeePerDay, start, end, withDriver) : 0), [start,end, withDriver, car]);
  const dp = Math.round(total*0.3);

  async function submit(){
    if(!start||!end||!name||!wa) { setMsg("Lengkapi tanggal, nama, WA"); return; }
    if(new Date(end) <= new Date(start)) { setMsg("Tanggal kembali harus setelah tanggal sewa"); return; }
    setLoading(true); setMsg("");
    try{
      const r = await fetch("/api/bookings", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ carId: car.id, carSlug: car.slug, start, end, mode, name, wa, total, payOption: pay })
      });
      const j = await r.json();
      if(!r.ok) setMsg(j.error || "Gagal booking (mungkin tanggal bentrok)");
      else { setMsg("Booking berhasil! ID: "+j.id+" — Admin akan hubungi WA. Silakan bayar DP/Full via transfer/QRIS."); }
    }catch(e:any){ setMsg("Error: "+e.message)}
    setLoading(false);
  }

  return (
    <div className="bg-white border rounded-2xl p-5 gloss">
      <h3 className="font-bold">Booking</h3>
      <div className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Tgl Sewa<input type="date" value={start} onChange={e=>setStart(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
          <label className="text-sm">Tgl Kembali<input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
        </div>
        <div className="flex gap-2 text-sm">
          <button onClick={()=>setMode("LEPAS_KUNCI")} className={`flex-1 py-2 rounded-full border ${mode==="LEPAS_KUNCI"?"bg-gray-900 text-white":"bg-white"}`}>Lepas Kunci</button>
          <button onClick={()=>setMode("DENGAN_SUPIR")} className={`flex-1 py-2 rounded-full border ${mode==="DENGAN_SUPIR"?"bg-gray-900 text-white":"bg-white"}`}>Dengan Supir</button>
        </div>
        {days>0 && <div className="text-sm bg-gray-50 p-3 rounded-xl">{days} hari × Rp {car.pricePerDay.toLocaleString("id-ID")} {withDriver?` + supir Rp ${car.driverFeePerDay.toLocaleString("id-ID")}/hari`:""} = <b>Rp {total.toLocaleString("id-ID")}</b> {pay==="DP 30%" && <span className="text-red-600"> (DP Rp {dp.toLocaleString("id-ID")})</span>}</div>}
        <input placeholder="Nama" value={name} onChange={e=>setName(e.target.value)} className="border rounded-xl px-3 py-2" />
        <input placeholder="No WA (08...)" value={wa} onChange={e=>setWa(e.target.value)} className="border rounded-xl px-3 py-2" />
        <div className="flex gap-2 text-sm">
          <button onClick={()=>setPay("DP 30%")} className={`flex-1 py-2 rounded-full border ${pay==="DP 30%"?"bg-red-600 text-white border-red-600":""}`}>DP 30%</button>
          <button onClick={()=>setPay("FULL")} className={`flex-1 py-2 rounded-full border ${pay==="FULL"?"bg-red-600 text-white border-red-600":""}`}>Bayar Full</button>
        </div>
        <button onClick={submit} disabled={loading} className="w-full py-3 rounded-full bg-red-600 text-white font-bold disabled:opacity-50">{loading?"Memproses...":"Booking Sekarang"}</button>
        <a href={waLink()} target="_blank" className="text-center py-3 rounded-full border font-semibold">Nego via WA</a>
        {msg && <div className="text-sm p-3 rounded-xl bg-red-50 border border-red-200">{msg}</div>}
        <div className="text-xs text-gray-500">Pembayaran: Transfer BCA/BRI/Mandiri atau QRIS (info dikirim WA setelah booking).</div>
      </div>
    </div>
  )
}
