"use client";
import { useState, useMemo, useEffect } from "react";
import { waLink, waBookingText } from "@/lib/wa";
import type { Car } from "@/lib/cars";

export default function Home(){
  const [cars,setCars]=useState<Car[]>([]);
  const [q,setQ]=useState("");
  const [cat,setCat]=useState("Semua");
  const [trans,setTrans]=useState("Semua");
  const [sort,setSort]=useState("termurah");
  useEffect(()=>{ fetch("/api/cars").then(r=>r.json()).then(setCars).catch(()=>{}); },[]);
  const cats = ["Semua","MPV","SUV","HIACE","HATCHBACK"];
  const filtered = useMemo(()=>{
    let r = cars.filter(c=>{
      if(cat!=="Semua" && c.category!==cat) return false;
      if(trans!=="Semua" && c.transmission!==trans) return false;
      if(q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    if(sort==="termurah") r=[...r].sort((a,b)=>a.pricePerDay-b.pricePerDay);
    if(sort==="termahal") r=[...r].sort((a,b)=>b.pricePerDay-a.pricePerDay);
    return r;
  },[q,cat,trans,sort,cars]);

  return (
    <div>
      <section className="bg-gradient-to-br from-red-600 to-red-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-5xl font-black leading-tight">Sewa Mobil Pekanbaru<br/>Gampang & Terpercaya</h1>
          <p className="mt-3 max-w-2xl text-white/90">Harian — Lepas Kunci & Dengan Supir. Cek katalog, cek tanggal, booking online atau nego via WA. Armada terawat, harga jujur.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#katalog" className="px-6 py-3 rounded-full bg-white text-red-600 font-bold">Lihat Katalog</a>
            <a href="https://wa.me/6283123768532?text=Halo%20Mashudi%20Transport%2C%20mau%20sewa%20mobil%20harian" target="_blank" className="px-6 py-3 rounded-full bg-black/20 border border-white/30 font-semibold">Nego via WA</a>
          </div>
          <div className="mt-4 text-sm text-white/80">Durasi harian • kalau butuh jam/bulanan, nego aja ke WA</div>
        </div>
      </section>

      <div id="katalog" className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari mobil (Avanza, Innova, Hiace...)" className="flex-1 border rounded-full px-5 py-3 outline-none" />
          <div className="flex flex-wrap gap-2">
            <select value={cat} onChange={e=>setCat(e.target.value)} className="border rounded-full px-4 py-2 bg-white">{cats.map(c=><option key={c}>{c}</option>)}</select>
            <select value={trans} onChange={e=>setTrans(e.target.value)} className="border rounded-full px-4 py-2 bg-white">
              <option>Semua</option><option>AT</option><option>MT</option>
            </select>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="border rounded-full px-4 py-2 bg-white">
              <option value="termurah">Termurah</option><option value="termahal">Termahal</option>
            </select>
          </div>
        </div>

        {cars.length===0 && <div className="text-center py-12 text-gray-400">Memuat armada...</div>}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c=>(
            <a key={c.id} href={`/mobil/${c.slug}`} className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition block group">
              <img src={c.images[0]} alt={c.name} className="h-44 w-full object-cover group-hover:scale-[1.02] transition" />
              <div className="p-4">
                <div className="text-xs text-gray-500">{c.category} • {c.transmission} • {c.seats} Seat • Stok {c.qty} unit</div>
                <h3 className="font-bold text-lg leading-tight mt-1 group-hover:text-red-600">{c.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1">{c.features.map(f=><span key={f} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{f}</span>)}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-black text-red-600">Rp {c.pricePerDay.toLocaleString("id-ID")}</span><span className="text-sm text-gray-500">/ hari</span>
                </div>
                <div className="text-xs text-gray-500">+ supir Rp {c.driverFeePerDay.toLocaleString("id-ID")}/hari</div>
                <div className="mt-3 flex gap-2" onClick={e=>e.preventDefault()}>
                  <span onClick={e=>{e.preventDefault(); window.location.href=`/booking?car=${c.slug}`;}} className="flex-1 text-center px-4 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 cursor-pointer block">Booking</span>
                  <a href={waLink(waBookingText(c.name,"...","...", "LEPAS_KUNCI", c.pricePerDay))} target="_blank" onClick={e=>e.stopPropagation()} className="px-4 py-2 rounded-full border font-semibold text-sm hover:bg-gray-50">WA</a>
                </div>
                <div className="mt-2 text-xs text-gray-400 text-center">Klik kartu untuk detail & booking →</div>
              </div>
            </a>
          ))}
        </div>
        {cars.length>0 && filtered.length===0 && <div className="text-center py-10 text-gray-500">Tidak ada mobil sesuai filter</div>}
      </div>
    </div>
  )
}
