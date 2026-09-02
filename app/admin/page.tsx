"use client";
import { useEffect, useState } from "react";
import type { Car } from "@/lib/cars";

type B = {id:string; carId:string; carName:string; name:string; wa:string; start:string; end:string; mode:string; total:number; payOption:string; status:string; payStatus?:string; proofUrl?:string; createdAt:string};

function getCookie(name:string){
  const m = document.cookie.match(new RegExp("(^| )"+name+"=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : "";
}

export default function Admin(){
  const [authed,setAuthed]=useState(false);
  const [user,setUser]=useState(""); const [pass,setPass]=useState(""); const [msg,setMsg]=useState("");
  const [bookings,setBookings]=useState<B[]>([]);
  const [cars,setCars]=useState<Car[]>([]);
  const [filter,setFilter]=useState("Semua");
  const [tab,setTab]=useState<"booking"|"armada"|"blog"|"banner"|"akun">("booking");
  const [showCarModal,setShowCarModal]=useState(false);
  const [editingCar,setEditingCar]=useState<Car|null>(null);
  const [form,setForm]=useState<any>({});
  const [uploading,setUploading]=useState(false);
  const [pwForm,setPwForm]=useState({currentPass:"", newUser:"", newPass:"", confirmPass:""});
  const [pwMsg,setPwMsg]=useState(""); const [pwOk,setPwOk]=useState("");
  const [posts,setPosts]=useState<any[]>([]); const [banners,setBanners]=useState<any[]>([]); const [blogForm,setBlogForm]=useState<any>({}); const [bannerForm,setBannerForm]=useState<any>({}); const [editingPost,setEditingPost]=useState<any>(null); const [editingBanner,setEditingBanner]=useState<any>(null);
  const [globalReq,setGlobalReq]=useState<string>("KTP, SIM A, Deposit / Jaminan"); const [globalMsg,setGlobalMsg]=useState("");

  function checkAuth(){ setAuthed(getCookie("mashudi_admin")==="mashudi-admin-v1"); }
  useEffect(()=>{ checkAuth(); if(getCookie("mashudi_admin")==="mashudi-admin-v1"){ load(); loadCars(); loadGlobalReq(); loadPosts(); loadBanners(); } },[]);

  async function login(){
    setMsg("");
    const r = await fetch("/api/admin/login",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({user, pass})});
    const j = await r.json();
    if(!r.ok){ setMsg(j.error||"Gagal login"); return; }
    setTimeout(checkAuth,100); setTimeout(()=>{load(); loadCars(); loadGlobalReq(); loadPosts(); loadBanners();},200);
  }
  async function logout(){
    await fetch("/api/admin/login",{method:"DELETE"});
    document.cookie="mashudi_admin=; path=/; max-age=0";
    setAuthed(false); setBookings([]); setCars([]);
  }
  async function load(){
    const r=await fetch("/api/admin/bookings");
    if(r.status===401){ setAuthed(false); return; }
    const j=await r.json(); setBookings(j);
  }
  async function loadCars(){
    const r=await fetch("/api/cars");
    const j=await r.json();
    // if authed fetch admin cars for freshest (same file)
    if(r.ok) setCars(j);
    // also try admin cars endpoint
    const r2 = await fetch("/api/admin/cars",{cache:"no-store"});
    if(r2.ok){ const j2=await r2.json(); setCars(j2); }
  }
  async function updateBooking(id:string, status:string){
    const r = await fetch("/api/admin/bookings/update",{method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id, status})});
    if(!r.ok){ alert("Gagal update: "+await r.text()); return; }
    const updated = await r.json();
    setBookings(prev=> prev.map(b=> b.id===id? updated: b));
  }
  async function deleteBooking(id:string){
    if(!confirm("Hapus booking ini?")) return;
    const r = await fetch(`/api/admin/bookings/update?id=${id}`,{method:"DELETE"});
    if(!r.ok){ alert("Gagal hapus"); return; }
    setBookings(prev=> prev.filter(b=>b.id!==id));
  }
  async function uploadFile(file:File):Promise<string>{
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/admin/upload",{method:"POST", body: fd});
    setUploading(false);
    if(!r.ok){ alert("Upload gagal: "+await r.text()); throw new Error("upload fail"); }
    const j = await r.json(); return j.url;
  }
  function openAdd(){
    setEditingCar(null);
    setForm({name:"", category:"MPV", transmission:"AT", seats:7, pricePerDay:350000, driverFeePerDay:150000, qty:1, features:"AC, Audio, Bagasi", requirements:"KTP, SIM A, Deposit", images:[]});
    setShowCarModal(true);
  }
  function openEdit(c:Car){
    setEditingCar(c);
    setForm({name:c.name, category:c.category, transmission:c.transmission, seats:c.seats, pricePerDay:c.pricePerDay, driverFeePerDay:c.driverFeePerDay, qty:c.qty, features:c.features.join(", "), requirements:(c.requirements||["KTP","SIM A","Deposit"]).join(", "), images:c.images});
    setShowCarModal(true);
  }
  async function saveCar(){
    const payload:any = {
      ...form,
      features: String(form.features||"").split(",").map((s:string)=>s.trim()).filter(Boolean),
      requirements: String(form.requirements||"").split(",").map((s:string)=>s.trim()).filter(Boolean),
      images: form.images||[],
    };
    let r;
    if(editingCar){
      r = await fetch("/api/admin/cars/"+editingCar.id, {method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...payload, id: editingCar.id})});
    } else {
      r = await fetch("/api/admin/cars", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)});
    }
    if(!r.ok){ alert("Gagal simpan: "+await r.text()); return; }
    setShowCarModal(false); loadCars();
  }
  async function changePw(){
    setPwMsg(""); setPwOk("");
    const r = await fetch("/api/admin/login",{method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(pwForm)});
    const j = await r.json();
    if(!r.ok){ setPwMsg(j.error||"Gagal ganti password"); return; }
    setPwOk("Berhasil! Username: "+j.user+" — password baru aktif.");
    setPwForm({currentPass:"", newUser:j.user, newPass:"", confirmPass:""});
  }
  async function deleteCar(id:string){
    if(!confirm("Hapus armada ini?")) return;
    const r = await fetch(`/api/admin/cars/${id}?id=${id}`, {method:"DELETE"});
    // fallback to query param route
    let r2 = r;
    if(!r.ok){
      r2 = await fetch(`/api/admin/cars/${id}`, {method:"DELETE"});
    }
    if(!r2.ok){
      // try alternative endpoint with id in json
      const rr = await fetch("/api/admin/cars/"+id, {method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({id})});
      if(!rr.ok){ alert("Gagal hapus: "+await rr.text()); return; }
    }
    loadCars();
  }
  async function loadGlobalReq(){
    try{
      const r = await fetch("/api/requirements");
      const j = await r.json();
      if(j.items) setGlobalReq(j.items.join(", "));
    }catch{}
  }
  async function loadPosts(){ try{ const r=await fetch("/api/admin/blog"); if(r.ok) setPosts(await r.json()); }catch{} }
  async function loadBanners(){ try{ const r=await fetch("/api/admin/banner"); if(r.ok) setBanners(await r.json()); }catch{} }
  async function savePost(){
    const payload={...blogForm};
    let r;
    if(editingPost) r=await fetch(`/api/admin/blog/${editingPost.id}`,{method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)});
    else r=await fetch("/api/admin/blog",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)});
    if(!r.ok){ alert("Gagal simpan post: "+await r.text()); return; }
    setEditingPost(null); setBlogForm({}); loadPosts();
  }
  async function deletePost(id:string){ if(!confirm("Hapus post?"))return; await fetch(`/api/admin/blog/${id}`,{method:"DELETE"}); loadPosts(); }
  async function saveBanner(){
    const payload={...bannerForm};
    let r;
    if(editingBanner) r=await fetch(`/api/admin/banner/${editingBanner.id}`,{method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)});
    else r=await fetch("/api/admin/banner",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)});
    if(!r.ok){ alert("Gagal simpan banner: "+await r.text()); return; }
    setEditingBanner(null); setBannerForm({}); loadBanners();
  }
  async function deleteBanner(id:string){ if(!confirm("Hapus banner?"))return; await fetch(`/api/admin/banner/${id}`,{method:"DELETE"}); loadBanners(); }
  async function saveGlobal(bulk:boolean){
    setGlobalMsg("");
    const items = globalReq.split(",").map((s:string)=>s.trim()).filter(Boolean);
    if(items.length===0){ setGlobalMsg("Isi minimal 1 persyaratan"); return; }
    const r = await fetch("/api/admin/requirements",{method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(bulk? {items, applyToAll:true} : {items})});
    const j = await r.json();
    if(!r.ok){ setGlobalMsg(j.error||"Gagal"); return; }
    setGlobalMsg(bulk? `Berhasil terapkan ke semua armada (${items.join(", ")})` : `Tersimpan global (${items.join(", ")})`);
    if(bulk) loadCars();
  }

  const filtered = bookings.filter(b=> filter==="Semua" ? true : b.status===filter.toLowerCase());
  const income = bookings.filter(b=>["paid","confirmed","dp_paid"].includes((b.payStatus||b.status))).reduce((s,b)=>s+b.total,0);
  const pending = bookings.filter(b=>b.status==="pending").length;

  if(!authed){
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border rounded-2xl p-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-black">M</div>
          <h1 className="mt-4 text-xl font-black">Admin Login</h1>
          <p className="text-sm text-gray-500">MASHUDI TRANSPORT — akses terbatas • QRIS/manual konfirmasi</p>
          <div className="mt-6 grid gap-3">
            <input placeholder="Username" value={user} onChange={e=>setUser(e.target.value)} className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-200" />
            <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-200" />
            {msg && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{msg}</div>}
            <button onClick={login} className="py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700">Masuk</button>
            <div className="text-xs text-gray-400 text-center">Default: admin / mashudi123 — ganti di tab Akun setelah login (tersimpan di data/admin.json)<br/>Middleware aktif: /api/admin/* butuh login</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2"><span className="w-9 h-9 rounded-full bg-red-600 text-white grid place-items-center text-sm">M</span> Admin — MASHUDI TRANSPORT</h1>
          <p className="text-sm text-gray-500 mt-1">{pending} pending • {bookings.length} total booking • QRIS & transfer manual (konfirmasi admin)</p>
          <div className="mt-3 flex gap-2">
            <button onClick={()=>setTab("booking")} className={`px-4 py-2 rounded-full text-sm font-bold border ${tab==="booking"?"bg-gray-900 text-white border-gray-900":"bg-white hover:bg-gray-50"}`}>Booking</button>
            <button onClick={()=>setTab("armada")} className={`px-4 py-2 rounded-full text-sm font-bold border ${tab==="armada"?"bg-gray-900 text-white border-gray-900":"bg-white hover:bg-gray-50"}`}>Armada ({cars.length})</button>
            <button onClick={()=>setTab("blog")} className={`px-4 py-2 rounded-full text-sm font-bold border ${tab==="blog"?"bg-gray-900 text-white border-gray-900":"bg-white hover:bg-gray-50"}`}>Blog ({posts.length})</button>
            <button onClick={()=>setTab("banner")} className={`px-4 py-2 rounded-full text-sm font-bold border ${tab==="banner"?"bg-gray-900 text-white border-gray-900":"bg-white hover:bg-gray-50"}`}>Banner ({banners.length})</button>
            <button onClick={()=>setTab("akun")} className={`px-4 py-2 rounded-full text-sm font-bold border ${tab==="akun"?"bg-gray-900 text-white border-gray-900":"bg-white hover:bg-gray-50"}`}>Akun</button>
          </div>
        </div>
        <button onClick={logout} className="px-4 py-2 rounded-full border text-sm hover:bg-gray-50">Logout</button>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <div className="text-xs tracking-widest text-gray-400 font-semibold">TOTAL BOOKING</div>
          <div className="text-3xl font-black mt-1">{bookings.length}</div>
          <div className="text-xs text-gray-500 mt-1">{pending} pending perlu tindak</div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-500 text-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs tracking-widest text-white/80 font-semibold">ESTIMASI PENDAPATAN</div>
          <div className="text-3xl font-black mt-1">Rp {income.toLocaleString("id-ID")}</div>
          <div className="text-xs text-white/80 mt-1">paid / confirmed / dp_paid (QRIS/manual verifikasi)</div>
        </div>
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <div className="text-xs tracking-widest text-gray-400 font-semibold">ARMADA</div>
          <div className="text-3xl font-black mt-1">{cars.length} tipe</div>
          <div className="text-xs text-gray-500 mt-1">Klik armada untuk edit • data/cars.json</div>
        </div>
      </div>

      {tab==="booking" && (
        <div className="mt-6 bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 flex flex-wrap gap-2 items-center justify-between border-b bg-gray-50/50">
            <h2 className="font-bold flex items-center gap-2">Daftar Booking <span className="text-xs font-normal text-gray-500">{filtered.length} data</span></h2>
            <div className="flex flex-wrap gap-2">
              {["Semua","pending","paid","confirmed","cancelled"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${filter===f?"bg-gray-900 text-white border-gray-900":"bg-white hover:bg-gray-50"}`}>{f}</button>
              ))}
              <button onClick={load} className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-700">Refresh</button>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs tracking-widest text-gray-400"><tr><th className="px-4 py-3 font-semibold">ID</th><th className="py-3">Mobil</th><th className="py-3">Penyewa</th><th className="py-3">Tanggal</th><th className="py-3">Mode/Bayar</th><th className="py-3">Total</th><th className="py-3">Status</th><th className="px-4 py-3">Aksi</th></tr></thead>
              <tbody>
                {filtered.map(b=>(
                  <tr key={b.id} className="border-t hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.id.slice(0,8)}</td>
                    <td className="py-3 font-medium">{b.carName}</td>
                    <td className="py-3">{b.name}<br/><span className="text-xs text-gray-500">{b.wa}</span></td>
                    <td className="py-3 text-xs"><span className="inline-flex flex-col"><span>{b.start}</span><span className="text-gray-400">→ {b.end}</span></span></td>
                    <td className="py-3 text-xs"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${b.mode==="DENGAN_SUPIR"?"bg-red-50 text-red-700 border border-red-200":"bg-gray-100 text-gray-700"}`}>{b.mode==="DENGAN_SUPIR"?"Dengan Supir":"Lepas Kunci"}</span><br/><span className="text-xs text-gray-500">{b.payOption} {b.proofUrl? "• bukti ada":""}</span></td>
                    <td className="py-3">Rp {Number(b.total).toLocaleString("id-ID")}</td>
                    <td className="py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${b.status==="pending"?"bg-amber-50 text-amber-700 border-amber-200": b.status==="paid"?"bg-blue-50 text-blue-700 border-blue-200": b.status==="confirmed"?"bg-green-50 text-green-700 border-green-200": b.status==="cancelled"?"bg-gray-100 text-gray-600":"bg-gray-100 text-gray-600"}`}>{b.status}{b.payStatus && b.payStatus!==b.status? `/${b.payStatus}`:""}</span>{b.proofUrl && <div className="mt-1"><a href={b.proofUrl} target="_blank" className="text-xs text-blue-600 underline">Lihat bukti</a></div>}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={()=>updateBooking(b.id,"confirmed")} className="px-2.5 py-1 rounded-full bg-green-600 text-white text-xs font-semibold hover:bg-green-700">Confirm</button>
                        <button onClick={()=>updateBooking(b.id,"paid")} className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">Paid</button>
                        <button onClick={()=>updateBooking(b.id,"cancelled")} className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">Cancel</button>
                        <button onClick={()=>deleteBooking(b.id)} className="px-2.5 py-1 rounded-full border text-xs font-semibold hover:bg-red-50">Hapus</button>
                        <a href={`https://wa.me/${b.wa.replace(/^0/,"62")}?text=${encodeURIComponent(`Halo ${b.name}, booking ${b.carName} tgl ${b.start} s/d ${b.end} kami konfirmasi. Pembayaran ${b.payOption} — QRIS/transfer sudah kami terima. Terima kasih - Mashudi Transport`)}`} target="_blank" className="px-2.5 py-1 rounded-full border text-xs font-semibold hover:bg-gray-50">WA</a>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">Belum ada booking</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-red-50 border-t border-red-200 text-xs text-red-800">QRIS / Transfer: <b>manual konfirmasi</b> — setelah penyewa upload bukti via WA, admin cek & klik Paid/Confirm di sini. ponytail: auto-verify via Midtrans webhook upgrade nanti.</div>
        </div>
      )}

      {tab==="armada" && (
        <div className="mt-6">
          <div className="bg-white border rounded-2xl p-5 shadow-sm mb-4">
            <h3 className="font-bold">Persyaratan Sewa (Global & Bulk)</h3>
            <p className="text-xs text-gray-500 mt-1">Ubah untuk semua armada sekaligus, atau edit per-mobil via klik kartu. Default: KTP, SIM A, Deposit</p>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input value={globalReq} onChange={e=>setGlobalReq(e.target.value)} placeholder="KTP, SIM A, Deposit, KK" className="flex-1 border rounded-xl px-3 py-2 text-sm" />
              <button onClick={()=>saveGlobal(false)} className="px-4 py-2 rounded-full border text-sm font-semibold hover:bg-gray-50">Simpan Global</button>
              <button onClick={()=>saveGlobal(true)} className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-700">Terapkan ke Semua Mobil</button>
            </div>
            {globalMsg && <div className="mt-2 text-xs p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">{globalMsg}</div>}
            <div className="mt-2 text-xs text-gray-400">Per-mobil: klik kartu → field Persyaratan → Simpan (hanya mobil itu yang berubah)</div>
          </div>
          <div className="flex justify-between items-center">
            <h2 className="font-bold">Armada ({cars.length}) — klik kartu untuk edit</h2>
            <button onClick={openAdd} className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-700">+ Tambah Armada</button>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cars.map(c=>(
              <div key={c.id} onClick={()=>openEdit(c)} className="border rounded-2xl overflow-hidden hover:shadow-md transition bg-white cursor-pointer group">
                <img src={c.images[0]} alt={c.name} className="h-36 w-full object-cover group-hover:scale-[1.02] transition" />
                <div className="p-4">
                  <div className="text-xs text-gray-500">{c.category} • {c.transmission} • {c.seats} seat • Stok {c.qty}</div>
                  <div className="font-bold leading-tight mt-1">{c.name}</div>
                  <div className="text-sm font-black text-red-600 mt-1">Rp {c.pricePerDay.toLocaleString("id-ID")}/hari</div>
                  <div className="text-xs text-gray-500">+ supir Rp {c.driverFeePerDay.toLocaleString("id-ID")}/hari</div>
                  <div className="mt-2 flex flex-wrap gap-1">{c.features.map(f=><span key={f} className="text-[10px] bg-gray-100 px-2 py-1 rounded-full">{f}</span>)}</div>
                  {c.requirements && c.requirements.length>0 && <div className="mt-2 flex flex-wrap gap-1">{c.requirements.map(r=><span key={r} className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-full">{r}</span>)}</div>}
                  <div className="mt-3 flex gap-2" onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>openEdit(c)} className="flex-1 py-2 rounded-full border text-xs font-semibold hover:bg-gray-50">Edit</button>
                    <button onClick={()=>deleteCar(c.id)} className="px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100">Hapus</button>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">Klik kartu untuk edit • slug: {c.slug}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
      
      {tab==="blog" && (
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold">Blog Kuliner ({posts.length})</h2>
            <button onClick={()=>{setEditingPost(null); setBlogForm({title:"", excerpt:"", content:"<p>Konten kuliner...</p>", cover:"/images/blog-sate.jpg", author:"MASHUDI Kuliner", tags:"kuliner, pekanbaru", category:"Kuliner"});}} className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-700">+ Tulis / Preview</button>
          </div>
          <div className="mt-4 bg-white border rounded-2xl p-5 shadow-sm grid gap-3">
            <input placeholder="Judul" value={blogForm.title||""} onChange={e=>setBlogForm({...blogForm, title:e.target.value})} className="border rounded-xl px-3 py-2" />
            <input placeholder="Excerpt (ringkas)" value={blogForm.excerpt||""} onChange={e=>setBlogForm({...blogForm, excerpt:e.target.value})} className="border rounded-xl px-3 py-2" />
            <input placeholder="Cover URL atau upload via /public/images (mis /images/blog-sate.jpg)" value={blogForm.cover||""} onChange={e=>setBlogForm({...blogForm, cover:e.target.value})} className="border rounded-xl px-3 py-2 text-sm" />
            <input type="file" accept="image/*" onChange={async e=>{ const f=e.target.files?.[0]; if(!f) return; const fd=new FormData(); fd.append("file",f); const r=await fetch("/api/admin/upload",{method:"POST", body:fd}); if(r.ok){ const j=await r.json(); setBlogForm((p:any)=>({...p, cover:j.url})); } }} className="text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Kategori" value={blogForm.category||""} onChange={e=>setBlogForm({...blogForm, category:e.target.value})} className="border rounded-xl px-3 py-2" />
              <input placeholder="Tags koma" value={blogForm.tags||""} onChange={e=>setBlogForm({...blogForm, tags:e.target.value})} className="border rounded-xl px-3 py-2" />
            </div>
            <input placeholder="Author" value={blogForm.author||""} onChange={e=>setBlogForm({...blogForm, author:e.target.value})} className="border rounded-xl px-3 py-2" />
            <textarea placeholder="Content HTML (boleh <p><b> dll)" value={blogForm.content||""} onChange={e=>setBlogForm({...blogForm, content:e.target.value})} rows={6} className="border rounded-xl px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button onClick={savePost} className="flex-1 py-3 rounded-full bg-red-600 text-white font-bold">{editingPost?"Update":"Tambah"} Post</button>
              {editingPost && <button onClick={()=>{setEditingPost(null); setBlogForm({})}} className="px-6 py-3 rounded-full border font-semibold">Batal Edit</button>}
            </div>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {posts.map((post:any)=>(
              <div key={post.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <img src={post.cover} alt={post.title} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <div className="text-xs text-red-600 font-bold tracking-widest">{post.category}</div>
                  <div className="font-bold leading-tight mt-1">{post.title}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{post.excerpt}</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>{setEditingPost(post); setBlogForm({...post, tags: (post.tags||[]).join(", ")})}} className="flex-1 py-2 rounded-full border text-xs font-semibold">Edit</button>
                    <button onClick={()=>deletePost(post.id)} className="px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">Hapus</button>
                    <a href={`/blog/${post.slug}`} target="_blank" className="px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold">Lihat</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="banner" && (
        <div className="mt-6">
          <h2 className="font-bold">Banner Popup Iklan Rental (Custom & Ratio)</h2>
          <p className="text-xs text-gray-500">Pop-up muncul di semua halaman (delay 1.2s, sekali per session). Atur judul, gambar, CTA, link, dan rasio (16/9, 4/3, 1/1, 9/16). Aktif/nonaktif per banner.</p>
          <div className="mt-4 bg-white border rounded-2xl p-5 shadow-sm grid gap-3">
            <input placeholder="Judul (mis: Sewa Avanza 350K/hari!)" value={bannerForm.title||""} onChange={e=>setBannerForm({...bannerForm, title:e.target.value})} className="border rounded-xl px-3 py-2" />
            <input placeholder="Subtitle" value={bannerForm.subtitle||""} onChange={e=>setBannerForm({...bannerForm, subtitle:e.target.value})} className="border rounded-xl px-3 py-2" />
            <input placeholder="Image URL (/images/banner-rental.jpg)" value={bannerForm.image||""} onChange={e=>setBannerForm({...bannerForm, image:e.target.value})} className="border rounded-xl px-3 py-2 text-sm" />
            <input type="file" accept="image/*" onChange={async e=>{ const f=e.target.files?.[0]; if(!f) return; const fd=new FormData(); fd.append("file",f); const r=await fetch("/api/admin/upload",{method:"POST", body:fd}); if(r.ok){ const j=await r.json(); setBannerForm((p:any)=>({...p, image:j.url})); } }} className="text-sm" />
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="CTA Text" value={bannerForm.ctaText||""} onChange={e=>setBannerForm({...bannerForm, ctaText:e.target.value})} className="border rounded-xl px-3 py-2" />
              <input placeholder="CTA Link (/#katalog)" value={bannerForm.ctaLink||""} onChange={e=>setBannerForm({...bannerForm, ctaLink:e.target.value})} className="border rounded-xl px-3 py-2" />
              <select value={bannerForm.aspect||"16/9"} onChange={e=>setBannerForm({...bannerForm, aspect:e.target.value})} className="border rounded-xl px-3 py-2 bg-white">
                <option>16/9</option><option>4/3</option><option>1/1</option><option>9/16</option><option>21/9</option>
              </select>
            </div>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={bannerForm.active!==false} onChange={e=>setBannerForm({...bannerForm, active:e.target.checked})} /> Aktif</label>
            {bannerForm.image && <div style={{aspectRatio: (bannerForm.aspect||"16/9").replace("/"," / ") as any}} className="w-full max-w-md border rounded-xl overflow-hidden bg-gray-100"><img src={bannerForm.image} alt="preview" className="w-full h-full object-cover" /></div>}
            <div className="flex gap-2">
              <button onClick={saveBanner} className="flex-1 py-3 rounded-full bg-red-600 text-white font-bold">{editingBanner?"Update":"Tambah"} Banner</button>
              {editingBanner && <button onClick={()=>{setEditingBanner(null); setBannerForm({})}} className="px-6 py-3 rounded-full border font-semibold">Batal Edit</button>}
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {banners.map((b:any)=>(
              <div key={b.id} className="bg-white border rounded-2xl p-4 flex gap-4 items-center shadow-sm">
                <img src={b.image} alt={b.title} style={{aspectRatio: b.aspect.replace("/"," / ") as any}} className="w-32 object-cover rounded-xl border" />
                <div className="flex-1">
                  <div className="font-bold leading-tight">{b.title}</div>
                  <div className="text-xs text-gray-500">{b.subtitle} • {b.aspect} • {b.active?"Aktif":"Nonaktif"}</div>
                  <div className="text-xs text-gray-400">{b.ctaText} → {b.ctaLink}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={()=>{setEditingBanner(b); setBannerForm(b)}} className="px-4 py-1.5 rounded-full border text-xs font-semibold">Edit</button>
                  <button onClick={()=>deleteBanner(b.id)} className="px-4 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="akun" && (
        <div className="mt-6 max-w-lg bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold">Ganti Username & Password</h2>
          <p className="text-xs text-gray-500 mt-1">Hash scrypt lokal di data/admin.json • Middleware proteksi /api/admin/* tetap aktif • QRIS manual</p>
          <div className="mt-4 grid gap-3">
            <input type="password" placeholder="Password lama" value={pwForm.currentPass} onChange={e=>setPwForm({...pwForm, currentPass:e.target.value})} className="border rounded-xl px-3 py-2" />
            <input placeholder="Username baru (kosongkan jika tetap)" value={pwForm.newUser} onChange={e=>setPwForm({...pwForm, newUser:e.target.value})} className="border rounded-xl px-3 py-2" />
            <input type="password" placeholder="Password baru (min 6)" value={pwForm.newPass} onChange={e=>setPwForm({...pwForm, newPass:e.target.value})} className="border rounded-xl px-3 py-2" />
            <input type="password" placeholder="Konfirmasi password baru" value={pwForm.confirmPass} onChange={e=>setPwForm({...pwForm, confirmPass:e.target.value})} className="border rounded-xl px-3 py-2" />
            {pwMsg && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{pwMsg}</div>}
            {pwOk && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">{pwOk}</div>}
            <button onClick={changePw} className="py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700">Simpan Perubahan</button>
            <div className="text-xs text-gray-400">Postgres (opsi 2) siap: set DATABASE_URL di .env lalu <code>npx prisma db push</code> — admin file-based tetap jalan sampai migrasi.</div>
          </div>
        </div>
      )}

      {showCarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h3 className="font-black text-lg">{editingCar? "Edit Armada":"Tambah Armada"}</h3>
            <p className="text-xs text-gray-500">QRIS manual aktif • gambar disimpan di public/images</p>
            <div className="mt-4 grid gap-3">
              <input placeholder="Nama mobil (Toyota Avanza 2023)" value={form.name||""} onChange={e=>setForm({...form, name:e.target.value})} className="border rounded-xl px-3 py-2" />
              <div className="grid grid-cols-3 gap-2">
                <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="border rounded-xl px-3 py-2 bg-white"><option>MPV</option><option>SUV</option><option>HIACE</option><option>HATCHBACK</option><option>SEDAN</option></select>
                <select value={form.transmission} onChange={e=>setForm({...form, transmission:e.target.value})} className="border rounded-xl px-3 py-2 bg-white"><option>AT</option><option>MT</option></select>
                <input type="number" placeholder="Seats" value={form.seats} onChange={e=>setForm({...form, seats:e.target.value})} className="border rounded-xl px-3 py-2" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Harga/hari" value={form.pricePerDay} onChange={e=>setForm({...form, pricePerDay:e.target.value})} className="border rounded-xl px-3 py-2" />
                <input type="number" placeholder="Fee supir/hari" value={form.driverFeePerDay} onChange={e=>setForm({...form, driverFeePerDay:e.target.value})} className="border rounded-xl px-3 py-2" />
                <input type="number" placeholder="Stok qty" value={form.qty} onChange={e=>setForm({...form, qty:e.target.value})} className="border rounded-xl px-3 py-2" />
              </div>
              <input placeholder="Fitur (pisah koma: AC, Audio, Bagasi)" value={form.features||""} onChange={e=>setForm({...form, features:e.target.value})} className="border rounded-xl px-3 py-2" />
              <input placeholder="Persyaratan (pisah koma: KTP, SIM A, Deposit)" value={form.requirements||""} onChange={e=>setForm({...form, requirements:e.target.value})} className="border rounded-xl px-3 py-2" />
              <div className="text-xs text-gray-400">Kosongkan pakai global • atau isi khusus mobil ini</div>
              <div>
                <div className="text-xs font-semibold text-gray-600">Gambar (upload, max 5MB, jpg/png/webp)</div>
                <input type="file" accept="image/*" onChange={async e=>{
                  const f = e.target.files?.[0]; if(!f) return;
                  const url = await uploadFile(f);
                  setForm((prev:any)=> ({...prev, images:[url, ...(prev.images||[])].slice(0,4)}));
                }} className="mt-1 w-full text-sm" />
                {uploading && <div className="text-xs text-red-600">Uploading...</div>}
                {form.images?.length>0 && <div className="mt-2 flex gap-2 flex-wrap">{form.images.map((u:string,i:number)=><img key={i} src={u} alt="" className="w-20 h-14 object-cover rounded-lg border" />)}</div>}
                <input placeholder="Atau paste URL gambar" value={form.images?.[0]||""} onChange={e=>setForm({...form, images:[e.target.value]})} className="mt-2 border rounded-xl px-3 py-2 w-full text-sm" />
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={()=>setShowCarModal(false)} className="flex-1 py-3 rounded-full border font-semibold">Batal</button>
                <button onClick={saveCar} className="flex-1 py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700">{editingCar? "Simpan":"Tambah"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
