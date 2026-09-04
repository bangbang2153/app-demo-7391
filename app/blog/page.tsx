"use client";

export default function BlogComingSoon(){
  return (
    <div className="bg-[#FFFBF5]">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-10 sm:py-12 min-w-0">
        <div className="bg-white border border-kabin rounded-[16px] overflow-hidden" style={{boxShadow:"0 1px 2px rgba(16,24,32,0.06)"}}>
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-0">
            <div className="relative h-[280px] sm:h-[360px] bg-[#FFF7ED] overflow-hidden p-4 flex items-center justify-center">
              <img src="/images/blog-rendang.svg" alt="Segera hadir" className="w-full h-full object-contain" loading="eager" />
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-center min-w-0">
              <h1 className="font-display text-[28px] sm:text-[36px] leading-[0.95] font-extrabold">Coming Soon</h1>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href="/#katalog" className="px-6 py-3 bg-bata text-white font-semibold text-sm rounded-full hover:bg-[#A81F25] transition-colors">Lihat Armada</a>
                <a href="/booking" className="px-6 py-3 bg-aspal text-white font-semibold text-sm rounded-full hover:bg-black transition-colors">Booking Mobil</a>
              </div>
              <p className="mt-4 text-xs text-gray-400">Armada tetap jalan normal di beranda.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
