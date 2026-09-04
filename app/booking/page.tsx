"use client";
import { useState, useMemo, useEffect } from "react";
import type { Car } from "@/lib/cars";
import CustomSelect from "@/components/CustomSelect";
import WaIcon from "@/components/WaIcon";
import { renderWaTemplate } from "@/lib/waTemplate";

export default function BookingPage(){
  const [cars,setCars]=useState<Car[]>([]);
  const [waNumber,setWaNumber]=useState("6282286906897");
  const [waTemplate,setWaTemplate]=useState("Halo Mashudi Transport, mau sewa (car) tgl (start) s/d (end) (mode). Total Rp (total). Bisa nego?");
  useEffect(()=>{
    fetch("/api/cars").then(r=>r.json()).then(setCars).catch(()=>{});
    fetch("/api/settings").then(r=>r.json()).then(s=>{
      if(s.waNumber) setWaNumber(s.waNumber);
      if(s.waTemplate) setWaTemplate(s.waTemplate);
    }).catch(()=>{});
  },[]);
  const [carSlug,setCarSlug]=useState<string>("");
  useEffect(()=>{ if(cars.length && !carSlug) setCarSlug(cars[0].slug); },[cars,carSlug]);
  const car = cars.find(c=>c.slug===carSlug);
  const [start,setStart]=useState("");
  const [end,setEnd]=useState("");
  const [mode,setMode]=useState<"LEPAS_KUNCI"|"DENGAN_SUPIR">("LEPAS_KUNCI");
  const [name,setName]=useState("");
  const [wa,setWa]=useState("");
  const [pay,setPay]=useState("DP 30%");
  const [msg,setMsg]=useState("");
  const [loading,setLoading]=useState(false);

  function waLink(){
    if(!car) return "#";
    const total = car.pricePerDay;
    const txt = renderWaTemplate(waTemplate, {car: car.name, start: start||"...", end: end||"...", mode, total: total.toLocaleString("id-ID")});
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(txt)}`;
  }

  const days = useMemo(()=> {
    if(!start||!end) return 0;
    const s=new Date(start), e=new Date(end);
    const diff=Math.ceil((e.getTime()-s.getTime())/86400000);
    return Math.max(1, diff||1);
  },[start,end]);

  const calcTotalLocal = (p:number,d:number,s:string,e:string,withDriver:boolean)=>{
    const sd=new Date(s), ed=new Date(e);
    const diff=Math.ceil((ed.getTime()-sd.getTime())/86400000);
    const days2=Math.max(1, diff||1);
    return days2*p + (withDriver? days2*d:0);
  };
  const totalVal = car && start && end ? calcTotalLocal(car.pricePerDay, car.driverFeePerDay, start, end, mode==="DENGAN_SUPIR") : 0;

  async function submit(){
    if(!car) return setMsg("Pilih mobil dulu");
    if(!start||!end||!name||!wa) return setMsg("Lengkapi semua field");
    if(new Date(end) <= new Date(start)) return setMsg("Tanggal kembali harus setelah sewa");
    setLoading(true); setMsg("");
    const r = await fetch("/api/bookings", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({carId:car.id, carSlug, start, end, mode, name, wa, total: totalVal, payOption:pay})});
    const j = await r.json();
    setMsg(r.ok ? "Berhasil! ID "+j.id+" — cek WA, admin akan hubungi." : (j.error||"Gagal"));
    setLoading(false);
  }

  const options = cars.map(c=>({
    value: c.slug,
    label: c.name,
    sub: `Rp ${c.pricePerDay.toLocaleString("id-ID")}/hari • ${c.category} • ${c.transmission} • ${c.seats} seat`,
    image: c.images[0]
  }));

  if(!car) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">Memuat armada...</div>;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8 min-w-0">
      <h1 className="text-2xl font-black">Booking Mobil</h1>
      <p className="text-sm text-gray-500">Pilih mobil dengan style kita sendiri — bukan dropdown browser</p>
      <div className="mt-6 bg-white border rounded-2xl p-4 sm:p-5 grid gap-4 gloss min-w-0">
        <label className="text-sm font-medium">Pilih Mobil
          <div className="mt-1">
            <CustomSelect options={options} value={carSlug} onChange={setCarSlug} placeholder="Pilih mobil..." />
          </div>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">Tgl Sewa<input type="date" value={start} onChange={e=>setStart(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
          <label className="text-sm">Tgl Kembali<input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
        </div>
        <div className="flex gap-2 text-sm">
          <button onClick={()=>setMode("LEPAS_KUNCI")} className={`flex-1 py-2 rounded-full border font-semibold ${mode==="LEPAS_KUNCI"?"bg-gray-900 text-white":"bg-white"}`}>Lepas Kunci</button>
          <button onClick={()=>setMode("DENGAN_SUPIR")} className={`flex-1 py-2 rounded-full border font-semibold ${mode==="DENGAN_SUPIR"?"bg-gray-900 text-white":"bg-white"}`}>Dengan Supir</button>
        </div>
        {days>0 && <div className="text-sm bg-gray-50 p-3 rounded-xl"> {days} hari = <b>Rp {totalVal.toLocaleString("id-ID")}</b> {pay==="DP 30%" && <span className="text-red-600"> • DP Rp {Math.round(totalVal*0.3).toLocaleString("id-ID")}</span>}</div>}
        <input placeholder="Nama" value={name} onChange={e=>setName(e.target.value)} className="border rounded-xl px-3 py-2" />
        <input placeholder="Nomor WhatsApp" value={wa} onChange={e=>setWa(e.target.value)} className="border rounded-xl px-3 py-2" />
        <div className="flex gap-2 text-sm">
          <button onClick={()=>setPay("DP 30%")} className={`flex-1 py-2 rounded-full border font-semibold ${pay==="DP 30%"?"bg-red-600 text-white border-red-600":""}`}>DP 30%</button>
          <button onClick={()=>setPay("FULL")} className={`flex-1 py-2 rounded-full border font-semibold ${pay==="FULL"?"bg-red-600 text-white border-red-600":""}`}>Bayar Full</button>
        </div>
        <div className="text-xs bg-red-50 border border-red-200 rounded-xl p-3">Pembayaran manual: <b>QRIS / Transfer</b> — info dikirim via WhatsApp setelah booking.</div>
        <button onClick={submit} disabled={loading} className="py-3 rounded-full bg-red-600 text-white font-bold disabled:opacity-50">{loading?"...":"Booking Sekarang"}</button>
        <a href={waLink()} target="_blank" className="text-center py-3 rounded-full border font-semibold inline-flex items-center justify-center gap-2"><WaIcon className="w-5 h-5" /> Chat</a>
        {msg && <div className="text-sm p-3 bg-red-50 border border-red-200 rounded-xl">{msg}</div>}
      </div>
    </div>
  )
}
