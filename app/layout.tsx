import "./globals.css";
import BannerPopup from "@/components/BannerPopup";
export const metadata = {
  title: "MASHUDI TRANSPORT - Sewa Mobil Pekanbaru Harian",
  description: "Rental mobil Pekanbaru: lepas kunci & dengan supir, harian. Avanza, Innova, Hiace. WA 0831-2376-8532. Booking online, bayar DP/Full.",
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="id">
      <body>
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-black text-xl tracking-tight">MASHUDI<span className="text-red-600"> TRANSPORT</span></a>
            <nav className="flex gap-2 items-center text-sm">
              <a href="/" className="px-3 py-1.5 rounded-full hover:bg-gray-100">Katalog</a>
              <a href="/blog" className="px-3 py-1.5 rounded-full hover:bg-gray-100">Kuliner</a>
              <a href="/booking" className="px-3 py-1.5 rounded-full hover:bg-gray-100">Booking</a>
              <a href="https://wa.me/6283123768532?text=Halo%20Mashudi%20Transport%2C%20mau%20tanya%20sewa%20mobil" target="_blank" className="hidden sm:inline px-4 py-1.5 rounded-full bg-red-600 text-white font-semibold">WA 0831-2376-8532</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <BannerPopup />
        <footer className="mt-16 border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-600 flex flex-col sm:flex-row justify-between gap-2">
            <span>MASHUDI TRANSPORT — Jl. Pekanbaru, Riau. Sewa harian, lepas kunci & dengan supir.</span>
            <span>WA 0831-2376-8532 • Pekanbaru • <a href="/blog" className="underline">Blog Kuliner</a></span>
          </div>
        </footer>
      </body>
    </html>
  )
}
