import { notFound } from "next/navigation";
import WaIcon from "@/components/WaIcon";
import { prisma } from "@/lib/prisma";

export default async function BlogDetail({params}:{params:{slug:string}}){
  let post:any = null;
  try{ post = await prisma.blogPost.findUnique({where:{slug: params.slug}}); }catch{}
  if(!post) return notFound();
  // increment views async
  try{ prisma.blogPost.update({where:{id:post.id}, data:{views:{increment:1}}}).then(()=>{}).catch(()=>{}); }catch{}
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <a href="/blog" className="text-sm text-gray-500">← Kembali blog kuliner</a>
      <div className="mt-4 text-xs tracking-widest text-red-600 font-bold">{post.category} • {post.author}</div>
      <h1 className="text-3xl font-black leading-tight mt-1">{post.title}</h1>
      <p className="text-sm text-gray-500 mt-2">{new Date(post.createdAt).toLocaleDateString("id-ID",{dateStyle:"long"})} • {post.views} views</p>
      <img loading="lazy" decoding="async" src={post.cover} alt={post.title} className="mt-6 w-full h-80 object-cover rounded-2xl border" />
      <div className="mt-3 flex flex-wrap gap-2">{post.tags.map((t:string)=><span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{t}</span>)}</div>
      <article className="prose prose-sm max-w-none mt-6 bg-white border rounded-2xl p-6 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html: post.content}} />
      <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="font-bold">Mau kulineran seharian di Pekanbaru?</div>
        <p className="text-sm text-gray-600 mt-1">Sewa Avanza 350K/hari atau Hiace 1.2jt — lepas kunci & dengan supir. Klik Booking, pilih tanggal harian, atau nego via WhatsApp.</p>
        <div className="mt-3 flex gap-2">
          <a href="/#katalog" className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-bold">Lihat Armada</a>
          <a href={`https://wa.me/6282286906897?text=${encodeURIComponent(`Halo Mashudi, habis baca blog `+post.title+`, mau sewa mobil`)}`} target="_blank" className="px-5 py-2.5 rounded-full border bg-white text-sm font-semibold inline-flex items-center gap-1.5"><WaIcon className="w-4 h-4" /> Chat</a>
        </div>
      </div>
      <div className="mt-6 flex justify-between text-sm">
        <a href="/blog" className="text-gray-500">← Semua kuliner</a>
        <a href="/booking" className="text-red-600 font-bold">Booking sekarang →</a>
      </div>
    </div>
  )
}
