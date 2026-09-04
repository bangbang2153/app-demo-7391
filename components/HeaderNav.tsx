"use client";
import { usePathname } from "next/navigation";
import WaIcon from "./WaIcon";

export default function HeaderNav(){
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const isKuliner = pathname.startsWith("/blog");
  return (
    <nav className="flex gap-1 sm:gap-2 items-center text-xs sm:text-sm shrink-0">
      {!isHome && <a href="/" className="px-2 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 whitespace-nowrap">Mobil</a>}
      {!isKuliner && <a href="/blog" className="px-2 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 whitespace-nowrap">Kuliner</a>}
      <a href="/booking" className="px-2 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 whitespace-nowrap">Booking</a>
      <a href="https://wa.me/6282286906897?text=Halo%20Mashudi%20Transport%2C%20mau%20tanya%20sewa%20mobil" target="_blank" className="hidden sm:inline px-4 py-1.5 rounded-full bg-red-600 text-white font-semibold inline-flex items-center gap-1.5"><WaIcon className="w-4 h-4" /> 0822-8690-6897</a>
    </nav>
  )
}
