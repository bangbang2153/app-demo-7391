"use client";
import { useEffect, useState, useRef } from "react";
type Post = {id:string; slug:string; title:string; excerpt:string; cover:string; author:string; tags:string[]; category:string; createdAt:string};
export default function Blog(){
  const [posts,setPosts]=useState<Post[]>([]);
  const [q,setQ]=useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ fetch("/api/blog").then(r=>r.json()).then(setPosts).catch(()=>{}); },[]);
  // auto scroll smooth
  useEffect(()=>{
    const el = scrollerRef.current;
    if(!el || posts.length===0) return;
    let dir = 1;
    const id = setInterval(()=>{
      if(!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if(el.scrollLeft >= max - 5) dir = -1;
      else if(el.scrollLeft <= 5) dir = 1;
      el.scrollBy({left: dir*280, behavior:"smooth"});
    }, 3200);
    return ()=>clearInterval(id);
  },[posts]);
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
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari sate, mie sagu, kopi..." className="flex-1 min-w-0 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 bg-white border outline-none text-sm" />
            <a href="#kuliner-slider" className="hidden sm:inline px-6 py-3 rounded-full bg-red-600 text-white font-bold text-sm">Geser Kuliner</a>
          </div>
        </div>
      </div>

      <div id="kuliner-slider" className="bg-[#fff7ed] overflow-hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-6 min-w-0">
          <div className="flex justify-end">
            <div className="flex gap-2">
              <button onClick={()=>scrollerRef.current?.scrollBy({left: -300, behavior:"smooth"})} className="w-8 h-8 rounded-full bg-white border grid place-items-center text-sm" aria-label="prev">‹</button>
              <button onClick={()=>scrollerRef.current?.scrollBy({left: 300, behavior:"smooth"})} className="w-8 h-8 rounded-full bg-white border grid place-items-center text-sm" aria-label="next">›</button>
            </div>
          </div>
          <div ref={scrollerRef} className="mt-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4" style={{scrollbarWidth:"thin"}}>
            {filtered.map(p=>(
              <a key={p.id} href={`/blog/${p.slug}`} className="snap-start shrink-0 w-72 bg-white rounded-2xl overflow-hidden border block gloss">
                <img loading="lazy" decoding="async" src={p.cover} alt={p.title} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <div className="text-xs text-red-600 font-bold tracking-widest">{p.category}</div>
                  <div className="font-bold leading-tight mt-1 line-clamp-2 text-gray-900">{p.title}</div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.excerpt}</p>
                  <div className="mt-3 text-xs text-gray-400">Baca kuliner →</div>
                </div>
              </a>
            ))}
            {filtered.length===0 && <div className="shrink-0 w-72 h-48 bg-white rounded-2xl border flex items-center justify-center text-sm text-gray-400">Tidak ada hasil untuk &quot;{q}&quot;</div>}
            {posts.length===0 && [0,1,2].map(i=><div key={i} className="shrink-0 w-72 h-48 bg-white rounded-2xl border animate-pulse"></div>)}
          </div>
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

      <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-10">
        <div className="text-center"><a href="/#katalog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white font-bold text-sm">List Mobil →</a></div>
      </div>
    </div>
  )
}
