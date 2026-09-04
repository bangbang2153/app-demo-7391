import "./globals.css";
import BannerPopup from "@/components/BannerPopup";
import HeaderNav from "@/components/HeaderNav";
export const viewport = { width: "device-width", initialScale: 1, maximumScale: 5 };
export const metadata = {
  title: "MASHUDI TRANSPORT - Sewa Mobil Pekanbaru Harian",
  description: "Rental mobil Pekanbaru: lepas kunci & dengan supir, harian. Avanza, Innova, Hiace. WA 0831-2376-8532. Booking online. Kuliner Pekanbaru di /blog - indexable.",
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="id">
      <body>
        <header className="sticky top-0 z-50 bg-white border-b gloss">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2 min-w-0">
            <a href="/" className="font-black text-base sm:text-xl tracking-tight shrink-0">MASHUDI<span className="text-red-600"> TRANSPORT</span></a>
            <HeaderNav />
          </div>
        </header>
        <main>{children}</main>
        <BannerPopup />
        <footer className="mt-16 border-t bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 text-xs sm:text-sm text-gray-600 flex flex-col sm:flex-row justify-between gap-2 break-words">
            <span>MASHUDI TRANSPORT — Jl. Pekanbaru, Riau. Sewa harian, lepas kunci & dengan supir.</span>
            <span className="inline-flex items-center gap-1.5">0831-2376-8532 • Pekanbaru</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
