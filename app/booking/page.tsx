"use client";
import { useState, useMemo, useEffect } from "react";
import type { Car } from "@/lib/cars";
import { calcTotal, daysBetween } from "@/lib/pricing";
import { waLink, waBookingText } from "@/lib/wa";

export default function BookingPage(){
  const [cars,setCars]=useState<Car[]>([]);
  useEffect(()=>{ fetch("/api/cars").then(r=>r.json()).then(setCars).catch(()=>{}); },[]);
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

  const days = useMemo(()=> start&&end ? daysBetween(start,end):0, [start,end]);
  const total = useMemo(()=> car && start&&end ? calcTotal(car.pricePerDay, car.driverFeePerDay, start,end, mode==="DENGAN_SUPIR"):0, [start,end,car,mode]);

  async function submit(){
    if(!car) return setMsg("Pilih mobil dulu");
    if(!start||!end||!name||!wa) return setMsg("Lengkapi semua field");
    if(new Date(end) <= new Date(start)) return setMsg("Tanggal kembali harus setelah sewa");
    setLoading(true); setMsg("");
    const r = await fetch("/api/bookings", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({carId:car.id, carSlug, start, end, mode, name, wa, total, payOption:pay})});
    const j = await r.json();
    setMsg(r.ok ? "Berhasil! ID "+j.id+" — cek WA, admin akan hubungi. Untuk QRIS/manual, upload bukti & tunggu konfirmasi admin." : (j.error||"Gagal"));
    setLoading(false);
  }

  if(!car) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">Memuat armada...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black">Booking Mobil</h1>
      <p className="text-sm text-gray-500">Durasi harian — nego jam/bulanan via WA 0831-2376-8532 • QRIS/manual konfirmasi admin</p>
      <div className="mt-6 bg-white border rounded-2xl p-5 grid gap-4 shadow-sm">
        <label className="text-sm font-medium">Pilih Mobil
          <select value={carSlug} onChange={e=>setCarSlug(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 bg-white">
            {cars.map(c=><option key={c.slug} value={c.slug}>{c.name} — Rp {c.pricePerDay.toLocaleString("id-ID")}/hari</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Tgl Sewa<input type="date" value={start} onChange={e=>setStart(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
          <label className="text-sm">Tgl Kembali<input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
        </div>
        <div className="flex gap-2 text-sm">
          <button onClick={()=>setMode("LEPAS_KUNCI")} className={`flex-1 py-2 rounded-full border font-semibold ${mode==="LEPAS_KUNCI"?"bg-gray-900 text-white":"bg-white"}`}>Lepas Kunci</button>
          <button onClick={()=>setMode("DENGAN_SUPIR")} className={`flex-1 py-2 rounded-full border font-semibold ${mode==="DENGAN_SUPIR"?"bg-gray-900 text-white":"bg-white"}`}>Dengan Supir</button>
        </div>
        {days>0 && <div className="text-sm bg-gray-50 p-3 rounded-xl"> {days} hari = <b>Rp {total.toLocaleString("id-ID")}</b> {pay==="DP 30%" && <span className="text-red-600"> • DP Rp {Math.round(total*0.3).toLocaleString("id-ID")}</span>}</div>}
        <input placeholder="Nama" value={name} onChange={e=>setName(e.target.value)} className="border rounded-xl px-3 py-2" />
        <input placeholder="No WA (08...)" value={wa} onChange={e=>setWa(e.target.value)} className="border rounded-xl px-3 py-2" />
        <div className="flex gap-2 text-sm">
          <button onClick={()=>setPay("DP 30%")} className={`flex-1 py-2 rounded-full border font-semibold ${pay==="DP 30%"?"bg-red-600 text-white border-red-600":""}`}>DP 30%</button>
          <button onClick={()=>setPay("FULL")} className={`flex-1 py-2 rounded-full border font-semibold ${pay==="FULL"?"bg-red-600 text-white border-red-600":""}`}>Bayar Full</button>
        </div>
        <div className="text-xs bg-red-50 border border-red-200 rounded-xl p-3">Pembayaran manual: <b>QRIS / Transfer BCA/BRI/Mandiri</b> — setelah booking, upload bukti di WA, admin akan konfirmasi manual.</div>
        <button onClick={submit} disabled={loading} className="py-3 rounded-full bg-red-600 text-white font-bold disabled:opacity-50">{loading?"...":"Booking Sekarang"}</button>
        <a href={waLink(waBookingText(car.name, start||"...", end||"...", mode, total))} target="_blank" className="text-center py-3 rounded-full border font-semibold hover:bg-gray-50">Nego via WA</a>
        {msg && <div className="text-sm p-3 bg-red-50 border border-red-200 rounded-xl">{msg}</div>}
      </div>
    </div>
  )
}
