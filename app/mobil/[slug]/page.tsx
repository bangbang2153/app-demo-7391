import { cars as seedCars } from "@/lib/cars";
import { notFound } from "next/navigation";
import BookingBox from "@/components/BookingBox";
import { prisma } from "@/lib/prisma";

export async function generateStaticParams(){ return seedCars.map(c=>({slug:c.slug})) }

export default async function Detail({params}:{params:{slug:string}}){
  let car:any = null;
  try{ car = await prisma.car.findUnique({where:{slug: params.slug}}); }catch{}
  if(!car) {
    try{
      const { readCars } = await import("@/lib/carsStore");
      const { getCarBySlug } = await import("@/lib/carsStore");
      car = getCarBySlug(params.slug) || seedCars.find(c=>c.slug===params.slug);
    }catch{ car = seedCars.find(c=>c.slug===params.slug); }
  }
  if(!car) return notFound();
  let globalReq: string[] = [];
  try{ const g = await prisma.globalRequirements.findUnique({where:{id:"global"}}); if(g) globalReq=g.items; }catch{}
  const reqs: string[] = car.requirements?.length ? car.requirements : (globalReq.length? globalReq : ["KTP","SIM A","Deposit"]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <a href="/" className="text-sm text-gray-500">← Kembali katalog</a>
      <div className="mt-4 grid lg:grid-cols-2 gap-8">
        <div>
          <img src={car.images[0]} alt={car.name} className="w-full h-80 object-cover rounded-2xl border" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {car.images.map((im:string,i:number)=><img key={i} src={im} alt="" className="h-24 object-cover rounded-xl border" />)}
          </div>
          <div className="mt-6 bg-white border rounded-2xl p-5">
            <h3 className="font-bold">Fasilitas</h3>
            <div className="mt-2 flex flex-wrap gap-2">{car.features.map((f:string)=><span key={f} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{f}</span>)}</div>
            <h3 className="font-bold mt-5">Persyaratan Sewa</h3>
            <ul className="mt-2 text-sm text-gray-600 list-disc ml-5 space-y-1">
              {reqs.map(r=><li key={r}>{r}</li>)}
              <li>Dengan supir: sudah termasuk driver, BBM & tol ditanggung penyewa.</li>
              <li>Durasi harian (24 jam), nego jam/bulanan via WA.</li>
              <li>QRIS / Transfer manual — upload bukti, admin konfirmasi manual.</li>
            </ul>
          </div>
        </div>
        <div>
          <div className="text-xs tracking-widest text-gray-400 font-semibold">{car.category} • {car.transmission} • {car.seats} kursi • Stok {car.qty}</div>
          <h1 className="text-3xl font-black mt-1">{car.name}</h1>
          <div className="mt-3 text-2xl font-black text-red-600">Rp {car.pricePerDay.toLocaleString("id-ID")} <span className="text-sm font-normal text-gray-500">/ hari</span></div>
          <div className="text-sm text-gray-500">Driver + Rp {car.driverFeePerDay.toLocaleString("id-ID")}/hari</div>
          <div className="mt-6"><BookingBox car={car} /></div>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
            Butuh nego harga/durasi? <a className="font-bold text-red-600" href={`https://wa.me/6283123768532?text=${encodeURIComponent(`Halo Mashudi Transport, mau nego `+car.name)}`} target="_blank">Chat WA 0831-2376-8532 →</a>
          </div>
        </div>
      </div>
    </div>
  )
}
