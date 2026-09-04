"use client";
import { useState, useMemo, useEffect } from "react";
import type { Car } from "@/lib/cars";
import { renderWaTemplate } from "@/lib/waTemplate";
import WaIcon from "@/components/WaIcon";

function waLink(number:string, template:string, car:string, start:string, end:string, mode:string, total:number){
  const txt = renderWaTemplate(template, {car, start, end, mode, total: total.toLocaleString("id-ID")});
  return `https://wa.me/${number}?text=${encodeURIComponent(txt)}`;
}

export default function Home(){
  const [cars,setCars]=useState<Car[]>([]);
  const [waNumber,setWaNumber]=useState("6282286906897");
  const [waTemplate,setWaTemplate]=useState("Halo Mashudi Transport, mau sewa (car) tgl (start) s/d (end) (mode). Total Rp (total). Bisa nego?");
  const [q,setQ]=useState("");
  const [cat,setCat]=useState("Semua");
  const [banner,setBanner]=useState<any>(null);
  const [heroIdx,setHeroIdx]=useState(0);
  const [trans,setTrans]=useState("Semua");
  const [sort,setSort]=useState("termurah");

  useEffect(()=>{
    fetch("/api/cars").then(r=>r.json()).then(setCars).catch(()=>{});
    fetch("/api/settings").then(r=>r.json()).then(s=>{ if(s.waNumber) setWaNumber(s.waNumber); if(s.waTemplate) setWaTemplate(s.waTemplate); }).catch(()=>{});
    fetch("/api/banner").then(r=>r.json()).then(b=>{ if(b && b.active!==false) setBanner(b); }).catch(()=>{});
  },[]);
  useEffect(()=>{
    if(cars.length===0) return;
    const id=setInterval(()=> setHeroIdx(i=> (i+1)%cars.length), 3200);
    return ()=>clearInterval(id);
  },[cars.length]);

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
      <section className="bg-bata text-white">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-10 sm:py-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
          <div className="min-w-0">
            <h1 className="font-display text-[28px] sm:text-[42px] leading-[0.95] font-extrabold">Sewa Mobil Pekanbaru<br/>Gampang dan Terpercaya</h1>
            <p className="mt-3 text-white/90 text-sm max-w-[60ch]">Harian, lepas kunci dan dengan supir. Armada dirawat, harga jelas. Pilih mobil di bawah, cek tanggal di Booking, atau tanya langsung.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#katalog" className="px-6 py-3 bg-white text-bata font-semibold text-sm rounded-full hover:bg-kabin transition-colors">Lihat armada</a>
              <a href="/blog" className="px-6 py-3 bg-aspal text-white font-semibold text-sm rounded-full hover:bg-black transition-colors">Kuliner Pekanbaru</a>
            </div>
            <p className="mt-3 text-xs text-white/70">Durasi harian. Butuh jam atau bulanan, nego WhatsApp.</p>
          </div>
          <div className="hidden lg:block rounded-[16px] overflow-hidden bg-white/10 border border-white/20">
            {cars.length>0 ? (
              <div className="relative">
                <img key={cars[heroIdx]?.slug||"hero"} src={cars[heroIdx]?.images[0]||"/images/avanza-2023.jpg"} alt={cars[heroIdx]?.name||"Armada MASHUDI"} className="w-full h-[300px] object-cover" loading="eager" decoding="async" />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 rounded-full px-2 py-1.5">
                  {cars.slice(0,6).map((_,i)=><span key={i} className={`w-1.5 h-1.5 rounded-full ${i===heroIdx%cars.length?"bg-white":"bg-white/40"}`}></span>)}
                </div>
              </div>
            ) : (
              <img src="/images/avanza-2023.jpg" alt="Armada MASHUDI di Pekanbaru" className="w-full h-[300px] object-cover" loading="eager" decoding="async" />
            )}
            <div className="px-4 py-3 bg-white text-aspal text-xs">
              <span className="font-semibold truncate block">{cars[heroIdx]?.name||"Armada tersedia"}</span>
            </div>
          </div>
        </div>
      </section>

      <div id="katalog" className="max-w-6xl mx-auto px-3 sm:px-4 py-7 sm:py-9 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-bold">Armada</h2>
          <span className="text-xs text-gray-500">{filtered.length} mobil - {cars.length} total</span>
        </div>

        <div className="mt-4 flex flex-col lg:flex-row gap-3 lg:items-center min-w-0">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari mobil" className="flex-1 min-w-0 border border-kabin rounded-full px-4 sm:px-5 py-2.5 sm:py-3 outline-none bg-white text-sm focus:border-bata" />
          <div className="flex flex-wrap gap-2 min-w-0">
            <select value={cat} onChange={e=>setCat(e.target.value)} className="border border-kabin rounded-full px-4 py-2 bg-white text-sm"><option>Semua</option><option>MPV</option><option>SUV</option><option>HIACE</option><option>HATCHBACK</option></select>
            <select value={trans} onChange={e=>setTrans(e.target.value)} className="border border-kabin rounded-full px-4 py-2 bg-white text-sm"><option>Semua</option><option>AT</option><option>MT</option></select>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="border border-kabin rounded-full px-4 py-2 bg-white text-sm"><option value="termurah">Termurah</option><option value="termahal">Termahal</option></select>
          </div>
        </div>

        {banner && (
          <div className="mt-5 border border-kabin rounded-[16px] overflow-hidden flex flex-col sm:flex-row bg-white">
            <div style={{aspectRatio: (banner.aspect||"16/9").replace("/"," / ") as any}} className="sm:w-72 w-full bg-kabin shrink-0 overflow-hidden">
              <img loading="lazy" decoding="async" src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center gap-2 min-w-0">
              <div className="text-xs font-semibold text-bata">Promo rental aktif di dekat armada</div>
              <div className="font-display font-bold leading-tight text-aspal">{banner.title}</div>
              {banner.subtitle && <div className="text-sm text-gray-600 max-w-[60ch]">{banner.subtitle}</div>}
              <div className="flex gap-2 mt-1">
                <a href={banner.ctaLink} className="px-5 py-2 rounded-full bg-bata text-white font-semibold text-sm text-center hover:bg-[#A81F25] transition-colors">{banner.ctaText}</a>
                <a href={waLink(waNumber, waTemplate, banner.title,"...","...", "LEPAS_KUNCI", 350000)} target="_blank" className="px-4 py-2 rounded-full border border-kabin font-semibold text-sm inline-flex items-center justify-center gap-1"><WaIcon className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
        )}

        {cars.length===0 && <div className="text-center py-12 text-gray-400 text-sm">Memuat armada</div>}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map(c=>(
            <a key={c.id} href={`/mobil/${c.slug}`} className="bg-white rounded-[16px] overflow-hidden border border-kabin block min-w-0 hover:border-bata/30 transition-colors" style={{boxShadow:"0 1px 2px rgba(16,24,32,0.06)"}}>
              <img loading="lazy" decoding="async" src={c.images[0]} alt={c.name} className="h-44 w-full object-cover" />
              <div className="p-4">
                <div className="text-xs text-gray-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sawit shrink-0"></span>{c.category} / {c.transmission} / {c.seats} kursi</div>
                <h3 className="font-display font-bold text-[17px] leading-tight mt-1">{c.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1">{c.features.slice(0,3).map(f=><span key={f} className="text-xs bg-kabin px-2 py-1 rounded-[8px]">{f}</span>)}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[18px] font-bold text-bata tabular-nums">Rp {c.pricePerDay.toLocaleString("id-ID")}</span><span className="text-xs text-gray-500">/ hari</span>
                </div>
                <div className="text-xs text-gray-500">Supir Rp {c.driverFeePerDay.toLocaleString("id-ID")}/hari</div>
                <div className="mt-3 flex gap-2" onClick={e=>e.preventDefault()}>
                  <span onClick={e=>{e.preventDefault(); window.location.href=`/booking?car=${c.slug}`;}} className="flex-1 text-center px-4 py-2 rounded-full bg-aspal text-white font-semibold cursor-pointer text-sm">Booking</span>
                  <a href={waLink(waNumber, waTemplate, c.name,"...","...", "LEPAS_KUNCI", c.pricePerDay)} target="_blank" onClick={e=>e.stopPropagation()} className="px-4 py-2 rounded-full border border-kabin font-semibold text-sm inline-flex items-center gap-1"><WaIcon className="w-4 h-4" /></a>
                </div>
              </div>
            </a>
          ))}
        </div>
        {cars.length>0 && filtered.length===0 && <div className="text-center py-10 text-gray-500 text-sm">Tidak ada mobil sesuai filter</div>}
      </div>
    </div>
  )
}
