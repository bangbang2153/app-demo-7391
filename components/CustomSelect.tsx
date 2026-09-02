"use client";
import { useState, useRef, useEffect } from "react";

type Option = { value: string; label: string; sub?: string; image?: string };

export default function CustomSelect({ options, value, onChange, placeholder }: { options: Option[]; value: string; onChange: (v:string)=>void; placeholder?: string }) {
  const [open,setOpen]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  const selected = options.find(o=>o.value===value);
  useEffect(()=>{
    function onClick(e:MouseEvent){
      if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return ()=>document.removeEventListener("mousedown", onClick);
  },[]);
  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={()=>setOpen(v=>!v)} className="w-full flex items-center justify-between gap-2 border rounded-xl px-3 py-3 bg-white text-left hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200">
        <span className="flex items-center gap-2 min-w-0">
          {selected?.image && <img src={selected.image} alt="" className="w-8 h-8 rounded-lg object-cover border shrink-0" />}
          <span className="min-w-0">
            <span className="block text-sm font-semibold truncate">{selected ? selected.label : (placeholder||"Pilih")}</span>
            {selected?.sub && <span className="block text-xs text-gray-500 truncate">{selected.sub}</span>}
          </span>
        </span>
        <span className={`shrink-0 text-gray-400 transition ${open?"rotate-180":""}`}>▾</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white border rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
          {options.map(o=>(
            <button key={o.value} type="button" onClick={()=>{ onChange(o.value); setOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-red-50 ${o.value===value?"bg-red-50":""}`}>
              {o.image && <img src={o.image} alt={o.label} className="w-10 h-10 rounded-lg object-cover border shrink-0" />}
              <span className="min-w-0 flex-1">
                <span className={`block text-sm truncate ${o.value===value?"font-bold text-red-600":"font-medium"}`}>{o.label}</span>
                {o.sub && <span className="block text-xs text-gray-500 truncate">{o.sub}</span>}
              </span>
              {o.value===value && <span className="text-red-600 text-sm">✓</span>}
            </button>
          ))}
          {options.length===0 && <div className="px-3 py-6 text-center text-sm text-gray-400">Tidak ada pilihan</div>}
        </div>
      )}
    </div>
  )
}
