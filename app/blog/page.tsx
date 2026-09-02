"use client";
import { useEffect, useState } from "react";
type Post = {id:string; slug:string; title:string; excerpt:string; cover:string; author:string; tags:string[]; category:string; createdAt:string};
export default function Blog(){
  const [posts,setPosts]=useState<Post[]>([]);
  const [q,setQ]=useState("");
  useEffect(()=>{ fetch("/api/blog").then(r=>r.json()).then(setPosts).catch(()=>{}); },[]);
  const filtered = posts.filter(p=> !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl p-6 sm:p-8 text-white">
        <h1 className="text-3xl font-black">Blog Kuliner Pekanbaru</h1>
        <p className="text-white/90 mt-2 max-w-2xl">Rekomendasi makanan enak di Pekanbaru — dari sate Padang sampai es durian. Cocok buat rute city tour sewa harian. Pop-up banner rental muncul otomatis, bisa kamu atur rasio banner di admin.</p>
        <div className="mt-4 flex gap-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari sate, mie sagu, kopi..." className="flex-1 rounded-full px-5 py-3 text-gray-900 outline-none" />
          <a href="/#katalog" className="hidden sm:inline px-6 py-3 rounded-full bg-white text-red-600 font-bold">Sewa Mobil</a>
        </div>
      </div>
      {posts.length===0 && <div className="text-center py-12 text-gray-400">Memuat kuliner...</div>}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(p=>(
          <a key={p.id} href={`/blog/${p.slug}`} className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition block">
            <img src={p.cover} alt={p.title} className="h-44 w-full object-cover" />
            <div className="p-4">
              <div className="text-xs text-red-600 font-bold tracking-widest">{p.category} • {new Date(p.createdAt).toLocaleDateString("id-ID")}</div>
              <h3 className="font-bold leading-tight mt-1 line-clamp-2">{p.title}</h3>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-1">{p.tags.map(t=><span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{t}</span>)}</div>
              <div className="mt-3 text-xs text-gray-400">{p.author}</div>
            </div>
          </a>
        ))}
      </div>
      {posts.length>0 && filtered.length===0 && <div className="text-center py-10 text-gray-500">Tidak ada hasil untuk &quot;{q}&quot;</div>}
    </div>
  )
}
