/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: { remotePatterns: [{protocol:'https', hostname:'images.unsplash.com'}, {protocol:'https', hostname:'**.unsplash.com'}, {protocol:'https', hostname:'source.unsplash.com'}] },
  async redirects() {
    return [{ source: "/kuliner", destination: "/blog", permanent: false }];
  },
};
export default nextConfig;
