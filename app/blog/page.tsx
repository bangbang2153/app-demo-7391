"use client";
import { useEffect, useState, useRef } from "react";
import { renderWaTemplate } from "@/lib/waTemplate";
import WaIcon from "@/components/WaIcon";
type Post = {id:string; slug:string; title:string; excerpt:string; cover:string; author:string; tags:string[]; category:string; createdAt:string};
type Car = {id:string; slug:string; name:string; category:string; transmission:string; seats:number; pricePerDay:number; driverFeePerDay:number; qty:number; images:string[]; features:string[]};

export default function Blog(){
  const [posts,setPosts]=useState<Post[]>([]);
  const [cars,setCars]=useState<Car[]>([]);
  const [q,setQ]=useState("");
  const [waNumber,setWaNumber]=useState("6283123768532");
  const [waTemplate,setWaTemplate]=useState("Halo Mashudi Transport, mau sewa (car) tgl (start) s/d (end) (mode). Total Rp (total). Bisa nego?");
  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ fetch("/api/blog").then(r=>r.json()).then(setPosts).catch(()=>{}); fetch("/api/cars").then(r=>r.json()).then(setCars).catch(()=>{}); fetch("/api/settings").then(r=>r.json()).then(s=>{ if(s.waNumber) setWaNumber(s.waNumber); if(s.waTemplate) setWaTemplate(s.waTemplate); }).catch(()=>{}); },[]);
  useEffect(()=>{
    const el = scrollerRef.current;
    if(!el || cars.length===0) return;
    let dir = 1;
    const id = setInterval(()=>{
      if(!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if(el.scrollLeft >= max - 5) dir = -1;
      else if(el.scrollLeft <= 5) dir = 1;
      el.scrollBy({left: dir*280, behavior:"smooth"});
    }, 3200);
    return ()=>clearInterval(id);
  },[cars]);
  const filtered = posts.filter(p=> !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase()));

  const jsonLd = {
    "@context":"https://schema.org",
    "@type":"ItemList",
    "name":"Kuliner Pekanbaru — MASHUDI TRANSPORT",
    "itemListElement": filtered.slice(0,10).map((p,i)=>({
      "@type":"ListItem", "position": i+1,
      "item": {"@type":"BlogPosting", "url": `https://mashudi.styna.my.id/blog/${p.slug}`, "name": p.title, "image": p.cover}
    }))
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="bg-[#fff7ed] border-b">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12 min-w-0">
          <div className="inline-flex items-center gap-2 text-xs tracking-widest text-red-600 font-bold bg-red-50 border border-red-200 px-3 py-1 rounded-full">KULINER PEKANBARU</div>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight mt-3 text-gray-900">Kuliner Pekanbaru<br/><span className="text-red-600">Enak & Hangat</span></h1>
          <p className="text-sm text-gray-600 mt-3 max-w-2xl">Rekomendasi hangat — sate Padang, mie sagu, patin, kopi Kimteng. Warna earthy biar nyambung sama makanan.</p>
          <div className="mt-6 flex gap-2 min-w-0">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari kuliner" className="flex-1 min-w-0 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 bg-white border outline-none text-sm" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 min-w-0">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map(p=>(
            <a key={p.id} href={`/blog/${p.slug}`} className="bg-white rounded-2xl overflow-hidden border block gloss min-w-0">
              <img loading="lazy" decoding="async" src={p.cover} alt={p.title} className="h-44 w-full object-cover" />
              <div className="p-4">
                <div className="text-xs text-red-600 font-bold tracking-widest">{p.category}</div>
                <div className="font-bold leading-tight mt-1 line-clamp-2 text-gray-900">{p.title}</div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.excerpt}</p>
                <div className="mt-3 text-xs text-gray-400">Baca kuliner →</div>
              </div>
            </a>
          ))}
          {filtered.length===0 && <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-2xl border p-8 text-center text-sm text-gray-400">Tidak ada hasil untuk &quot;{q}&quot;</div>}
          {posts.length===0 && [0,1,2].map(i=><div key={i} className="h-64 bg-white rounded-2xl border animate-pulse"></div>)}
        </div>
      </div>

      <div className="h-8 bg-gradient-to-b from-[#fff7ed] to-[#f8fafc]"></div>
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
        <div className="py-3 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span className="w-6 h-px bg-orange-200"></span>
          <span className="px-3 py-1 rounded-full bg-white border text-gray-600 font-semibold">↓ Pelengkap Perjalanan Mu</span>
          <span className="w-6 h-px bg-orange-200"></span>
        </div>
      </div>

      <div className="bg-[#f8fafc] overflow-hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black tracking-tight">Armada</h2>
            <div className="flex gap-2">
              <button onClick={()=>scrollerRef.current?.scrollBy({left: -300, behavior:"smooth"})} className="w-8 h-8 rounded-full bg-white border grid place-items-center text-sm" aria-label="prev">‹</button>
              <button onClick={()=>scrollerRef.current?.scrollBy({left: 300, behavior:"smooth"})} className="w-8 h-8 rounded-full bg-white border grid place-items-center text-sm" aria-label="next">›</button>
            </div>
          </div>
          <div ref={scrollerRef} className="mt-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4" style={{scrollbarWidth:"thin"}}>
            {cars.map(c=>(
              <a key={c.id} href={`/mobil/${c.slug}`} className="snap-start shrink-0 w-72 bg-white rounded-2xl overflow-hidden border block gloss">
                <img loading="lazy" decoding="async" src={c.images[0]} alt={c.name} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <div className="text-xs text-gray-500">{c.category} • {c.transmission} • {c.seats} Seat</div>
                  <div className="font-bold leading-tight mt-1 line-clamp-2">{c.name}</div>
                  <div className="mt-2 text-sm font-black text-red-600">Rp {c.pricePerDay.toLocaleString("id-ID")}<span className="text-xs font-normal text-gray-500">/hari</span></div>
                  <div className="mt-3 flex gap-2" onClick={e=>e.preventDefault()}>
                    <span onClick={e=>{e.preventDefault(); window.location.href=`/booking?car=${c.slug}`;}} className="flex-1 text-center px-3 py-2 rounded-full bg-red-600 text-white font-semibold text-xs cursor-pointer">Booking</span>
                    <span onClick={e=>{e.preventDefault(); window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(renderWaTemplate(waTemplate,{car:c.name,start:"...",end:"...",mode:"LEPAS_KUNCI",total:c.pricePerDay.toLocaleString("id-ID")}))}`,"_blank"); e.stopPropagation();}} className="px-3 py-2 rounded-full border font-semibold text-xs cursor-pointer inline-flex items-center gap-1"><WaIcon className="w-3.5 h-3.5" /></span>
                  </div>
                </div>
              </a>
            ))}
            {cars.length===0 && [0,1,2].map(i=><div key={i} className="shrink-0 w-72 h-44 bg-white rounded-2xl border animate-pulse"></div>)}
          </div>
        </div>
      </div>
    </div>
  )
}
