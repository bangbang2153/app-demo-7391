"use client";
import { useState } from "react";

export default function CarGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const list = images?.length ? images : ["/images/avanza-2023.jpg"];
  const cur = list[Math.min(active, list.length - 1)];
  return (
    <>
      <img onClick={()=>setLightbox(true)} loading="lazy" decoding="async" src={cur} alt={name} className="w-full h-80 object-cover rounded-2xl border cursor-zoom-in hover:opacity-95" />
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {list.map((im, i)=>(
            <button key={i} onClick={()=>setActive(i)} className={`rounded-xl overflow-hidden border-2 ${i===active?"border-red-600":"border-transparent"} hover:opacity-90`}>
              <img loading="lazy" decoding="async" src={im} alt="" className="h-24 w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {lightbox && (
        <div onClick={()=>setLightbox(false)} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <button onClick={()=>setLightbox(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white grid place-items-center">✕</button>
          <img onClick={e=>e.stopPropagation()} src={cur} alt={name} className="max-h-[85vh] max-w-[95vw] object-contain rounded-2xl" />
          {list.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 rounded-full px-3 py-2">
              {list.map((_, i)=>(
                <button key={i} onClick={(e)=>{e.stopPropagation(); setActive(i);}} className={`w-2.5 h-2.5 rounded-full ${i===active?"bg-white":"bg-white/40"}`} aria-label={`foto ${i+1}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
