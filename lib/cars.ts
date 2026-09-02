export type Car = {
  id: string; slug: string; name: string; category: string; transmission: string; seats: number;
  pricePerDay: number; driverFeePerDay: number; qty: number; images: string[]; features: string[]; requirements?: string[]; status: string;
};
export const cars: Car[] = [
  {
    id:"1", slug:"avanza-2023", name:"Toyota Avanza 2023", category:"MPV", transmission:"AT", seats:7,
    pricePerDay:350000, driverFeePerDay:150000, qty:2,
    images:["/images/avanza-2023.jpg","/images/avanza-2023.jpg","/images/xenia-2022.jpg"],
    features:["AC Double Blower","Audio Bluetooth","Bagasi Luas"], requirements:["KTP","SIM A","Deposit"], status:"active"
  },
  {
    id:"2", slug:"xenia-2022", name:"Daihatsu Xenia 2022", category:"MPV", transmission:"MT", seats:7,
    pricePerDay:350000, driverFeePerDay:150000, qty:1,
    images:["/images/xenia-2022.jpg","/images/xenia-2022.jpg","/images/avanza-2023.jpg"],
    features:["Irit BBM","Kabin Lega","Cocok Keluarga"], requirements:["KTP","SIM A","Deposit"], status:"active"
  },
  {
    id:"3", slug:"innova-reborn-2023", name:"Toyota Innova Reborn 2023", category:"MPV", transmission:"AT", seats:7,
    pricePerDay:550000, driverFeePerDay:150000, qty:2,
    images:["/images/innova-reborn-2023.jpg","/images/innova-reborn-2023.jpg","/images/innova-zenix-2023.jpg"],
    features:["Diesel Irit","Captain Seat","Nyaman Jarak Jauh"], requirements:["KTP","SIM A","Deposit"], status:"active"
  },
  {
    id:"4", slug:"fortuner-gr-2023", name:"Toyota Fortuner GR 2023", category:"SUV", transmission:"AT", seats:7,
    pricePerDay:900000, driverFeePerDay:200000, qty:1,
    images:["/images/fortuner-gr-2023.jpg","/images/fortuner-gr-2023.jpg","/images/innova-reborn-2023.jpg"],
    features:["4x2 Tangguh","Sunroof","Premium"], requirements:["KTP","SIM A","Deposit"], status:"active"
  },
  {
    id:"5", slug:"hiace-commuter-2023", name:"Toyota Hiace Commuter 15 Seat", category:"HIACE", transmission:"MT", seats:15,
    pricePerDay:1200000, driverFeePerDay:200000, qty:1,
    images:["/images/hiace-commuter-2023.jpg","/images/hiace-commuter-2023.jpg","/images/xpander-2023.jpg"],
    features:["15 Seat","AC Dingin","Cocok Rombongan"], requirements:["KTP","SIM A","Deposit"], status:"active"
  },
  {
    id:"6", slug:"innova-zenix-2023", name:"Toyota Innova Zenix Hybrid 2023", category:"MPV", transmission:"AT", seats:7,
    pricePerDay:750000, driverFeePerDay:150000, qty:1,
    images:["/images/innova-zenix-2023.jpg","/images/innova-zenix-2023.jpg","/images/innova-reborn-2023.jpg"],
    features:["Hybrid Irit","Modern","Interior Mewah"], requirements:["KTP","SIM A","Deposit"], status:"active"
  },
  {
    id:"7", slug:"brio-2023", name:"Honda Brio Satya 2023", category:"HATCHBACK", transmission:"MT", seats:5,
    pricePerDay:300000, driverFeePerDay:120000, qty:2,
    images:["/images/brio-2023.jpg","/images/brio-2023.jpg","/images/xpander-2023.jpg"],
    features:["Irit Kota","Mudah Parkir","Anak Muda"], requirements:["KTP","SIM A","Deposit"], status:"active"
  },
  {
    id:"8", slug:"xpander-2023", name:"Mitsubishi Xpander 2023", category:"MPV", transmission:"AT", seats:7,
    pricePerDay:450000, driverFeePerDay:150000, qty:1,
    images:["/images/xpander-2023.jpg","/images/xpander-2023.jpg","/images/brio-2023.jpg"],
    features:["Stylish","Ground Clearance Tinggi","Keluarga"], requirements:["KTP","SIM A","Deposit"], status:"active"
  },
];
export function getCar(slug:string){ return cars.find(c=>c.slug===slug) }
