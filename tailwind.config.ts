import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bata: "#C1272D",
        sawit: "#E9A426",
        aspal: "#1A1E22",
        kabin: "#EDEEF0",
        daun: "#1B3329",
        brand: { 50:"#fef2f2", 100:"#fee2e2", 500:"#C1272D", 600:"#A81F25", 700:"#7f1d1d", 900:"#450a0a" }
      },
      fontFamily: {
        display: ["Bricolage Grotesque","system-ui","sans-serif"],
        body: ["Instrument Sans","system-ui","sans-serif"],
      }
    },
  },
  plugins: [],
};
export default config;
