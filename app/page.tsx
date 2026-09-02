"use client";
import { useState, useMemo, useEffect } from "react";
import type { Car } from "@/lib/cars";
import { renderWaTemplate } from "@/lib/waTemplate";

function waLink(number:string, template:string, car:string, start:string, end:string, mode:string, total:number){
  const txt = renderWaTemplate(template, {car, start, end, mode, total: total.toLocaleString("id-ID")});
  return `https://wa.me/${number}?text=${encodeURIComponent(txt)}`;
}

export default function Home(){
  const [cars,setCars]=useState<Car[]>([]);
  const [waNumber,setWaNumber]=useState("6283123768532");
  const [waTemplate,setWaTemplate]=useState("Halo Mashudi Transport, mau sewa (car) tgl (start) s/d (end) (mode). Total Rp (total). Bisa nego?");
  const [q,setQ]=useState("");
  const [cat,setCat]=useState("Semua");
  const [banner,setBanner]=useState<any>(null);
  const [trans,setTrans]=useState("Semua");
  const [sort,setSort]=useState("termurah");

  useEffect(()=>{
    fetch("/api/cars").then(r=>r.json()).then(setCars).catch(()=>{});
    fetch("/api/settings").then(r=>r.json()).then(s=>{ if(s.waNumber) setWaNumber(s.waNumber); if(s.waTemplate) setWaTemplate(s.waTemplate); }).catch(()=>{});
    fetch("/api/banner").then(r=>r.json()).then(b=>{ if(b && b.active!==false) setBanner(b); }).catch(()=>{});
  },[]);

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
      <section className="bg-red-600 text-white gloss">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12 min-w-0">
          <h1 className="text-2xl sm:text-5xl font-black leading-tight break-words">Sewa Mobil Pekanbaru<br/>Gampang & Terpercaya</h1>
          <p className="mt-3 max-w-2xl text-white/90 text-sm sm:text-base">Harian — Lepas Kunci & Dengan Supir. Armada terawat, harga jujur.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#katalog" className="px-6 py-3 rounded-full bg-white text-red-600 font-bold text-sm">Lihat Armada</a>
            <a href="/blog" className="px-6 py-3 rounded-full bg-black/20 border border-white/30 font-semibold text-sm">Kuliner Pekanbaru →</a>
          </div>
          <div className="mt-4 text-xs text-white/80">Durasi harian • kalau butuh jam/bulanan, nego WA</div>
        </div>
      </section>

      <div id="katalog" className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 min-w-0">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs tracking-widest text-red-600 font-bold">ARMADA</div>
            <h2 className="text-2xl font-black">Pilih Mobil</h2>
          </div>
          {banner && (
            <span className="hidden sm:inline text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-full font-bold">● Banner Aktif</span>
          )}
        </div>
        {banner && (
          <div className="mt-4 bg-white border rounded-2xl overflow-hidden gloss flex flex-col sm:flex-row">
            <div style={{aspectRatio: (banner.aspect||"16/9").replace("/"," / ") as any}} className="sm:w-72 w-full bg-gray-100 shrink-0 overflow-hidden">
              <img loading="lazy" decoding="async" src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center gap-2">
              <div className="text-xs tracking-widest text-red-600 font-bold">PROMO RENTAL — AKTIF DI DEKAT ARMADA</div>
              <div className="font-black leading-tight text-gray-900">{banner.title}</div>
              {banner.subtitle && <div className="text-sm text-gray-600">{banner.subtitle}</div>}
              <div className="flex gap-2 mt-1">
                <a href={banner.ctaLink} className="px-5 py-2 rounded-full bg-red-600 text-white font-bold text-sm text-center">{banner.ctaText}</a>
                <a href={waLink(waNumber, waTemplate, banner.title,"...","...", "LEPAS_KUNCI", 350000)} target="_blank" className="px-5 py-2 rounded-full border font-bold text-sm text-center">WA</a>
              </div>
              <div className="text-xs text-gray-400">Rasio {banner.aspect}</div>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-col lg:flex-row gap-3 lg:items-center justify-between min-w-0">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari mobil (Avanza, Innova, Hiace...)" className="flex-1 min-w-0 border rounded-full px-4 sm:px-5 py-2.5 sm:py-3 outline-none bg-white text-sm sm:text-base" />
          <div className="flex flex-wrap gap-2 min-w-0">
            <select value={cat} onChange={e=>setCat(e.target.value)} className="border rounded-full px-4 py-2 bg-white text-sm"><option>Semua</option><option>MPV</option><option>SUV</option><option>HIACE</option><option>HATCHBACK</option></select>
            <select value={trans} onChange={e=>setTrans(e.target.value)} className="border rounded-full px-4 py-2 bg-white text-sm">
              <option>Semua</option><option>AT</option><option>MT</option>
            </select>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="border rounded-full px-4 py-2 bg-white text-sm">
              <option value="termurah">Termurah</option><option value="termahal">Termahal</option>
            </select>
          </div>
        </div>

        {cars.length===0 && <div className="text-center py-12 text-gray-400 text-sm">Memuat armada...</div>}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map(c=>(
            <a key={c.id} href={`/mobil/${c.slug}`} className="bg-white rounded-2xl overflow-hidden border block gloss min-w-0">
              <img loading="lazy" decoding="async" src={c.images[0]} alt={c.name} className="h-44 w-full object-cover" />
              <div className="p-4">
                <div className="text-xs text-gray-500">{c.category} • {c.transmission} • {c.seats} Seat • Stok {c.qty} unit</div>
                <h3 className="font-bold text-lg leading-tight mt-1">{c.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1">{c.features.map(f=><span key={f} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{f}</span>)}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-black text-red-600">Rp {c.pricePerDay.toLocaleString("id-ID")}</span><span className="text-sm text-gray-500">/ hari</span>
                </div>
                <div className="text-xs text-gray-500">+ supir Rp {c.driverFeePerDay.toLocaleString("id-ID")}/hari</div>
                <div className="mt-3 flex gap-2" onClick={e=>e.preventDefault()}>
                  <span onClick={e=>{e.preventDefault(); window.location.href=`/booking?car=${c.slug}`;}} className="flex-1 text-center px-4 py-2 rounded-full bg-red-600 text-white font-semibold cursor-pointer block text-sm">Booking</span>
                  <a href={waLink(waNumber, waTemplate, c.name,"...","...", "LEPAS_KUNCI", c.pricePerDay)} target="_blank" onClick={e=>e.stopPropagation()} className="px-4 py-2 rounded-full border font-semibold text-sm">WA</a>
                </div>
                <div className="mt-2 text-xs text-gray-400 text-center">Klik kartu untuk detail →</div>
              </div>
            </a>
          ))}
        </div>
        {cars.length>0 && filtered.length===0 && <div className="text-center py-10 text-gray-500 text-sm">Tidak ada mobil sesuai filter</div>}
      </div>
    </div>
  )
}
