"use client";
import { useEffect, useState } from "react";
import { renderWaTemplate } from "@/lib/waTemplate";

type Banner = {id:string; title:string; subtitle?:string; image:string; ctaText:string; ctaLink:string; aspect:string};

export default function BannerPopup(){
  const [banner,setBanner]=useState<Banner|null>(null);
  const [open,setOpen]=useState(false);
  const [ratio,setRatio]=useState("16/9");
  const [waNumber,setWaNumber]=useState("6283123768532");
  const [waTpl,setWaTpl]=useState("");

  useEffect(()=>{
    fetch("/api/banner").then(r=>r.json()).then(b=>{
      if(!b || !b.title) return;
      setBanner(b);
      setRatio(b.aspect||"16/9");
      const dismissed = sessionStorage.getItem("banner_dismissed");
      if(!dismissed) setTimeout(()=>setOpen(true), 10000);
    }).catch(()=>{});
    fetch("/api/settings").then(r=>r.json()).then(s=>{
      if(s.waNumber) setWaNumber(s.waNumber);
      if(s.waTemplate) setWaTpl(s.waTemplate);
    }).catch(()=>{});
  },[]);

  if(!banner || !open) return null;

  const onClose =()=>{
    setOpen(false);
    sessionStorage.setItem("banner_dismissed","1");
  };
  const waText = waTpl ? renderWaTemplate(waTpl, {car: banner.title, start: "...", end: "...", mode: "LEPAS_KUNCI", total: "350000"}) : banner.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl overflow-hidden max-w-lg w-[calc(100%-1.5rem)] sm:w-full relative border gloss">
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white grid place-items-center text-sm z-10">✕</button>
        <div style={{aspectRatio: ratio.replace("/"," / ") as any}} className="w-full bg-gray-100 overflow-hidden">
          <img loading="lazy" decoding="async" src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-5">
          <div className="text-xs tracking-widest text-red-600 font-bold">MASHUDI TRANSPORT — PROMO</div>
          <h3 className="text-lg font-black leading-tight mt-1">{banner.title}</h3>
          {banner.subtitle && <p className="text-sm text-gray-600 mt-1">{banner.subtitle}</p>}
          <div className="mt-4 flex gap-2 items-center">
            <a href={banner.ctaLink} onClick={onClose} className="flex-1 text-center py-3 rounded-full bg-red-600 text-white font-bold">{banner.ctaText}</a>
            <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`} target="_blank" className="px-5 py-3 rounded-full border font-semibold text-sm">WA</a>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">Rasio: {ratio} • 10 detik setelah masuk</span>
            <button onClick={onClose} className="text-xs text-gray-500 underline">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  )
}
