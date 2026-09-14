"use client";
import { useEffect, useState } from "react";

type Item = { uraian: string; harga: number };
type Align = "left" | "center" | "right";

const TEMPLATE_URAIAN = "Sewa Mobil Daihtsu xenia BM 1412 UA selama 7 hari terhitung dari\ntanggal 12 April, 2026 hingga 19 April, 2026";

function fmtRp(n: number){ return "Rp" + (Number(n)||0).toLocaleString("id-ID") + ",00"; }

export default function InvoicePage(){
  const [defaultLogo, setDefaultLogo] = useState<string|null>(null);
  const [customLogo, setCustomLogo] = useState<string|null>(null);
  const [stamp, setStamp] = useState<string|null>(null);
  const [logoChoice, setLogoChoice] = useState<"default"|"custom">("default");

  const [cName, setCName] = useState("PT MASHUDI PRIMA TRANSPORT INDONESIA");
  const [cAddr, setCAddr] = useState("Jln.FIRDAUS NO 39A TANGKERANG LABUAI - BUKIT RAYA PEKANBARU");
  const [cNpwp, setCNpwp] = useState("1091 0312 1095 0578");
  const [cPhone, setCPhone] = useState("082293239631");
  const [invNo, setInvNo] = useState("RENT/II/21/2026");
  const [invDate, setInvDate] = useState("2026-04-12");
  const [toName, setToName] = useState("Mohammad Amrul Faiz");
  const [toCo, setToCo] = useState("PT.MITRA PERKAS MULTIGUNA");
  const [toCity, setToCity] = useState("PEKANBARU");
  const [items, setItems] = useState<Item[]>([{uraian: TEMPLATE_URAIAN, harga: 2100000}]);
  const [bank, setBank] = useState("BCA");
  const [bankAcc, setBankAcc] = useState("DIAN MILLY CHRISTY");
  const [bankNo, setBankNo] = useState("8135664771");
  const [sigName, setSigName] = useState("DIAN MILLY CHRISTY");
  const [notes, setNotes] = useState("");
  const [notesAlign, setNotesAlign] = useState<Align>("left");
  const [toast, setToast] = useState("");

  useEffect(()=>{
    fetch("/api/invoice/state").then(r=>r.json()).then(j=>{
      if(j.defaultLogo) setDefaultLogo(j.defaultLogo);
      if(j.customLogo){ setCustomLogo(j.customLogo); setLogoChoice("custom"); }
      if(j.stamp) setStamp(j.stamp);
    }).catch(()=>{});
  },[]);

  function showToast(m:string){ setToast(m); setTimeout(()=> setToast(""), 2800); }

  const total = items.reduce((s,i)=> s + (Number(i.harga)||0), 0);
  const invDateFmt = (()=>{ const [y,m,d]=invDate.split("-"); return d && m && y ? `${d}/${m}/${y}` : invDate; })();

  const activeLogo = logoChoice==="custom" && customLogo ? customLogo : defaultLogo;

  async function uploadLogo(file: File){
    const fd=new FormData(); fd.append("logo", file);
    try{
      const r=await fetch("/api/invoice/upload/logo",{method:"POST", body: fd});
      const j=await r.json();
      if(j.url){
        const bust=j.url+"?v="+Date.now();
        setCustomLogo(bust);
        setLogoChoice("custom");
        showToast("Logo berhasil diupload! ✓");
      } else showToast(j.error||"Gagal upload logo");
    }catch{ showToast("Gagal upload logo. Coba lagi."); }
  }
  async function resetLogo(){
    await fetch("/api/invoice/upload/logo/reset",{method:"POST"});
    setCustomLogo(null);
    setLogoChoice("default");
    showToast("Kembali ke logo default.");
  }
  async function uploadStamp(file: File){
    const fd=new FormData(); fd.append("stamp", file);
    try{
      const r=await fetch("/api/invoice/upload/stamp",{method:"POST", body: fd});
      const j=await r.json();
      if(j.url){
        setStamp(j.url+"?v="+Date.now());
        showToast("Stempel berhasil diupload! ✓");
      } else showToast(j.error||"Gagal upload stempel");
    }catch{ showToast("Gagal upload stempel. Coba lagi."); }
  }

  function handlePrint(){
    const prevTitle=document.title;
    // kosongkan title biar header print browser gak nulis "Invoice Generator..." di atas kertas
    document.title="";
    window.print();
    setTimeout(()=>{ document.title=prevTitle; }, 1000);
  }

  const notesHtml = (notes||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\n/g,"<br/>");

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="/invoice/css/style.css" />
      <div className="topbar">
        <h1>📄 Invoice Generator</h1>
        <span className="topbar-sub">PT Mashudi Prima Transport Indonesia</span>
        <div className="topbar-actions">
          <button className="btn-print secondary" onClick={handlePrint}>⬇ Save as PDF</button>
          <button className="btn-print" onClick={handlePrint}>🖨 Print</button>
        </div>
      </div>
      <div className="workspace">
        <div className="form-panel">
          {/* LOGO */}
          <div className="form-section">
            <div className="section-label">Logo Perusahaan</div>
            <div className="logo-options">
              <div className={`logo-opt ${logoChoice==="default"?"active":""}`} onClick={()=> { setLogoChoice("default"); }}>
                {defaultLogo ? <img src={defaultLogo} alt="Default Logo" /> : <span style={{fontSize:28}}>🏢</span>}
                <span>Logo Default<br/>Mashudi</span>
              </div>
              <div className={`logo-opt ${logoChoice==="custom"?"active":""}`} onClick={()=> document.getElementById("logoFileInput")?.click()}>
                {customLogo ? <img src={customLogo} alt="Custom Logo" /> : <span style={{fontSize:28}}>📁</span>}
                <span>{customLogo ? "Logo Kustom ✓" : "Upload Logo Baru"}</span>
              </div>
            </div>
            <input type="file" id="logoFileInput" accept="image/*" style={{display:"none"}} onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadLogo(f); }} />
            {customLogo && <button className="btn-reset-logo" onClick={resetLogo}>↩ Gunakan logo default</button>}
          </div>
          <hr className="divider" />

          {/* INFO PERUSAHAAN */}
          <div className="form-section">
            <div className="section-label">Info Perusahaan</div>
            <div className="form-group"><label>Nama Perusahaan</label><input value={cName} onChange={e=> setCName(e.target.value)} /></div>
            <div className="form-group"><label>Alamat</label><textarea rows={2} value={cAddr} onChange={e=> setCAddr(e.target.value)} /></div>
            <div className="form-group"><label>NPWP</label><input value={cNpwp} onChange={e=> setCNpwp(e.target.value)} /></div>
            <div className="form-group"><label>HP / WA</label><input value={cPhone} onChange={e=> setCPhone(e.target.value)} /></div>
          </div>
          <hr className="divider" />

          {/* DETAIL INVOICE */}
          <div className="form-section">
            <div className="section-label">Detail Invoice</div>
            <div className="form-group"><label>Nomor Invoice</label><input value={invNo} onChange={e=> setInvNo(e.target.value)} /></div>
            <div className="form-group"><label>Tanggal</label><input type="date" value={invDate} onChange={e=> setInvDate(e.target.value)} /></div>
          </div>
          <hr className="divider" />

          {/* KEPADA */}
          <div className="form-section">
            <div className="section-label">Kepada</div>
            <div className="form-group"><label>Nama Penerima</label><input value={toName} onChange={e=> setToName(e.target.value)} /></div>
            <div className="form-group"><label>Perusahaan</label><input value={toCo} onChange={e=> setToCo(e.target.value)} /></div>
            <div className="form-group"><label>Kota</label><input value={toCity} onChange={e=> setToCity(e.target.value)} /></div>
          </div>
          <hr className="divider" />

          {/* URAIAN */}
          <div className="form-section">
            <div className="section-label">Uraian / Item</div>
            <div id="itemsContainer">
              {items.map((it,i)=> (
                <div key={i} className="item-card">
                  <div className="item-card-header"><span>Item {i+1}</span><button className="btn-del-item" onClick={()=> { if(items.length===1){ showToast("Minimal harus ada 1 item."); return;} setItems(items.filter((_,idx)=> idx!==i)); }}>×</button></div>
                  <label>Uraian / Deskripsi</label>
                  <textarea className="uraian-textarea" value={it.uraian} onChange={e=> { const c=[...items]; c[i].uraian=e.target.value; setItems(c); }} placeholder="Tulis keterangan lengkap di sini..." />
                  <label>Harga (Rp)</label>
                  <input className="harga-input" type="number" min={0} step={1000} value={it.harga} onChange={e=> { const c=[...items]; c[i].harga= parseFloat(e.target.value)||0; setItems(c); }} />
                </div>
              ))}
            </div>
            <button className="btn-add-item" onClick={()=> setItems([...items, {uraian:"", harga:0}])}>+ Tambah Item</button>
          </div>

          {/* CATATAN BAWAH TABEL — bebas ketik + rata */}
          <div className="form-section" style={{marginTop:14, background:"#1e1e3a", border:"1px solid #3a3a5c", borderRadius:8, padding:12}}>
            <div className="section-label" style={{color:"#e8e0d4"}}>Catatan di bawah tabel — bebas ketik</div>
            <div className="form-group">
              <textarea
                rows={4}
                value={notes}
                onChange={e=> setNotes(e.target.value)}
                placeholder={"Ketik bebas di sini — contoh:\nTerima kasih atas kepercayaannya.\nPembayaran paling lambat 7 hari.\nBarang yang sudah dibeli tidak dapat dikembalikan."}
                style={{background:"#252542", border:"1px solid #3a3a5c", color:"#e8e0d4", borderRadius:6, padding:"10px 11px", fontSize:13, lineHeight:1.6}}
              />
            </div>
            <div style={{display:"flex", gap:6, alignItems:"center", flexWrap:"wrap"}}>
              <span style={{fontSize:11, color:"#9a9abc"}}>Rata:</span>
              {(["left","center","right"] as Align[]).map(a=>(
                <button
                  key={a}
                  onClick={()=> setNotesAlign(a)}
                  className={`align-btn ${notesAlign===a?"active":""}`}
                  style={{
                    padding:"6px 12px", borderRadius:6, fontSize:12, cursor:"pointer",
                    border: notesAlign===a ? "1px solid #c0392b" : "1px solid #3a3a5c",
                    background: notesAlign===a ? "#c0392b" : "#252542",
                    color: notesAlign===a ? "#fff" : "#9a9abc"
                  }}
                  title={a}
                >
                  {a==="left" ? "▤ Rata Kiri" : a==="center" ? "☰ Tengah" : "▤ Rata Kanan"}
                </button>
              ))}
              <span style={{fontSize:10, color:"#7a7a9a", marginLeft:"auto"}}>{notesAlign==="left"?"kiri":notesAlign==="center"?"tengah":"kanan"}</span>
            </div>
            <p style={{fontSize:10, color:"#7a7a9a", marginTop:6}}>Preview langsung di invoice — kosong = tidak tampil. Save as PDF ikut tercetak.</p>
          </div>

          <hr className="divider" />

          {/* PEMBAYARAN */}
          <div className="form-section">
            <div className="section-label">Detail Pembayaran</div>
            <div className="form-group"><label>Nama Bank</label><input value={bank} onChange={e=> setBank(e.target.value)} /></div>
            <div className="form-group"><label>Nama Akun</label><input value={bankAcc} onChange={e=> setBankAcc(e.target.value)} /></div>
            <div className="form-group"><label>No. Rekening</label><input value={bankNo} onChange={e=> setBankNo(e.target.value)} /></div>
          </div>
          <hr className="divider" />

          {/* DIAJUKAN OLEH */}
          <div className="form-section">
            <div className="section-label">Diajukan Oleh</div>
            <div className="form-group"><label>Nama</label><input value={sigName} onChange={e=> setSigName(e.target.value)} /></div>
            <div className="section-label" style={{marginTop:12}}>Stempel / Cap</div>
            <div className="upload-box" onClick={()=> document.getElementById("stampFileInput")?.click()}>
              <input type="file" id="stampFileInput" accept="image/*" style={{display:"none"}} onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadStamp(f); }} />
              {stamp ? (
                <>
                  <img src={stamp} alt="Stempel" style={{maxHeight:60, objectFit:"contain"}} />
                  <span>Stempel tersimpan ✓<br/><small>Klik untuk ganti</small></span>
                </>
              ):(
                <div>
                  <div className="upload-icon">🔵</div>
                  <p>Klik untuk upload stempel/cap<br/>(PNG transparan)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="preview-panel">
          <div className="invoice-doc" id="invoiceDoc">
            <div className="inv-header">
              <div className="inv-logo-area">
                {activeLogo ? <img src={activeLogo} alt="Logo" /> : <div className="inv-logo-placeholder">Logo</div>}
                <div className="inv-company">
                  <h2>{cName}</h2>
                  <p>{cAddr}</p>
                  <p>NPWP : <span>{cNpwp}</span></p>
                  <p>HP/WA : <span>{cPhone}</span></p>
                </div>
              </div>
              <div className="inv-meta">
                <div className="inv-title">Invoice</div>
                <table><tbody><tr><td>Invoice</td><td>: <span>{invNo}</span></td></tr><tr><td>Tanggal</td><td>: <span>{invDateFmt}</span></td></tr></tbody></table>
              </div>
            </div>

            <div className="inv-to">
              <p>Kepada Yth.</p>
              <h3>{toName}</h3>
              <span>(<span>{toCo}</span>)</span><br/>
              <span>di <span>{toCity}</span></span>
            </div>

            <table className="inv-table">
              <thead><tr><th className="no-col">No</th><th>Uraian</th><th className="right-col">Harga (Rp)</th><th className="right-col">Total</th></tr></thead>
              <tbody>
                {items.map((it,i)=> (
                  <tr key={i}>
                    <td className="no-col">{i+1}</td>
                    <td dangerouslySetInnerHTML={{__html: (it.uraian||"-").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\n/g,"<br/>") }} />
                    <td className="price-col">{fmtRp(it.harga)}</td>
                    <td className="total-col">{fmtRp(it.harga)}</td>
                  </tr>
                ))}
                {/* sub total gabung di tabel — baris terakhir, tanpa shape, hanya garis atas */}
                <tr className="inv-subtotal-row">
                  <td colSpan={3} style={{textAlign:"right", fontWeight:700, borderTop:"1px solid #000"}}>Sub Total</td>
                  <td className="total-col" style={{borderTop:"1px solid #000"}}>{fmtRp(total)}</td>
                </tr>
              </tbody>
            </table>

            {/* catatan bebas di bawah tabel — tampil hanya kalau ada isi */}
            {notes.trim() && (
              <div
                className="inv-notes"
                style={{
                  textAlign: notesAlign,
                  margin: "10px 0 14px",
                  padding: "10px 14px",
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: "#1a1a2e",
                  background: "#f0ece4",
                  borderLeft: "3px solid #c0392b",
                  borderRadius: "0 6px 6px 0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}
                dangerouslySetInnerHTML={{__html: notesHtml}}
              />
            )}

            <div className="inv-footer">
              <div className="inv-payment">
                <h4>Detail Pembayaran</h4>
                <table><tbody>
                  <tr><td>Nama Bank</td><td>{bank}</td></tr>
                  <tr><td>Nama Akun</td><td>{bankAcc}</td></tr>
                  <tr><td>No.Rekening</td><td>{bankNo}</td></tr>
                </tbody></table>
              </div>
              <div className="inv-sign">
                <p>Diajukan Oleh</p>
                <div className="stamp-area">
                  {stamp ? <img src={stamp} alt="Stempel" style={{maxWidth:110, maxHeight:95, objectFit:"contain", opacity:.85}} /> : <div className="stamp-placeholder">Upload<br/>Stempel</div>}
                </div>
                <strong>{sigName}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && <div className="toast show">{toast}</div>}
      <style>{`@media print{ body{background:white} .topbar,.form-panel{display:none!important} .workspace{display:block;height:auto} .preview-panel{background:white;padding:0} .invoice-doc{box-shadow:none;margin:0;width:100%} .inv-notes{break-inside:avoid} }`}</style>
    </>
  );
}
