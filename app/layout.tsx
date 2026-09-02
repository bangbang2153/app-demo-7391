import "./globals.css";
import BannerPopup from "@/components/BannerPopup";
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
            <nav className="flex gap-1 sm:gap-2 items-center text-xs sm:text-sm shrink-0">
              <a href="/" className="px-2 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 whitespace-nowrap">Mobil</a>
              <a href="/blog" className="px-2 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 whitespace-nowrap">Kuliner</a>
              <a href="/booking" className="px-2 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 whitespace-nowrap">Booking</a>
              <a href="https://wa.me/6283123768532?text=Halo%20Mashudi%20Transport%2C%20mau%20tanya%20sewa%20mobil" target="_blank" className="hidden sm:inline px-4 py-1.5 rounded-full bg-red-600 text-white font-semibold">WA 0831-2376-8532</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <BannerPopup />
        <footer className="mt-16 border-t bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 text-xs sm:text-sm text-gray-600 flex flex-col sm:flex-row justify-between gap-2 break-words">
            <span>MASHUDI TRANSPORT — Jl. Pekanbaru, Riau. Sewa harian, lepas kunci & dengan supir.</span>
            <span>WA 0831-2376-8532 • Pekanbaru</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
