import "./globals.css";
import BannerPopup from "@/components/BannerPopup";
import HeaderNav from "@/components/HeaderNav";
export const viewport = { width: "device-width", initialScale: 1, maximumScale: 5 };
export const metadata = {
  title: "MASHUDI TRANSPORT - Sewa Mobil Pekanbaru Harian",
  description: "Rental mobil Pekanbaru: lepas kunci & dengan supir, harian. Avanza, Innova, Hiace. WA 0822-8690-6897. Booking online. Kuliner Pekanbaru di /blog.",
};
function FbIcon(){return(<svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3c-2.76 0-5 2.24-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.55.45-1 1-1z"/></svg>)}
function IgIcon(){return(<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>)}
function TtIcon(){return(<svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-1.78 4.8 4.8 0 01-1.12-3.1V2H10.9v12.1a2.8 2.8 0 01-2.8 2.8 2.8 2.8 0 01-2.8-2.8 2.8 2.8 0 012.8-2.8c.22 0 .43.03.63.08V7.6a6.6 6.6 0 00-.63-.03 6.6 6.6 0 00-6.6 6.6 6.6 6.6 0 006.6 6.6 6.6 6.6 0 006.6-6.6V8.93a7.6 7.6 0 004.4 1.4V6.69z"/></svg>)}
export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="id">
      <body>
        <header className="sticky top-0 z-50 bg-white border-b border-kabin">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2 min-w-0">
            <a href="/" className="font-display font-extrabold text-base sm:text-xl tracking-tight shrink-0">MASHUDI<span className="text-bata"> TRANSPORT</span></a>
            <HeaderNav />
          </div>
        </header>
        <main>{children}</main>
        <BannerPopup />
        <footer className="mt-16 border-t border-kabin bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 text-xs sm:text-sm text-gray-600 break-words">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div className="max-w-[60ch] space-y-1">
                <div className="font-display font-bold text-aspal">MASHUDI TRANSPORT</div>
                <div>Jl. Kurnia No.4, Tengkerang Labuai, Bukit Raya, Kota Pekanbaru, Riau 28289</div>
                <div className="flex flex-wrap gap-2 items-center">
                  <a href="https://maps.app.goo.gl/JMX4412Xb1WMf9BZ7" target="_blank" rel="noopener noreferrer" className="underline">Lihat di Maps</a>
                  <span>•</span>
                  <span>0822-8690-6897 • Pekanbaru</span>
                </div>
                <div className="text-xs text-gray-400 pt-1">Sewa harian, lepas kunci dan dengan supir. Armada dirawat, harga jelas.</div>
              </div>
              <div className="space-y-2 shrink-0">
                <div className="text-xs font-semibold tracking-wide text-aspal">Ikuti Kami</div>
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#1877F2] text-white grid place-items-center"><FbIcon/></span> Facebook: mashudi rent car</span>
                  <span className="inline-flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#515BD4] text-white grid place-items-center"><IgIcon/></span> IG: mashudi rental mobil PKU</span>
                  <span className="inline-flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-black text-white grid place-items-center"><TtIcon/></span> TikTok: rental_mobil_pekanbaru_mashudi</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
