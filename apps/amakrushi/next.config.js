/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
}

module.exports = {
  nextConfig,
  typescript: {
    ignoreBuildErrors: true,    
  },
  i18n: {
    locales: ['or','en'],
    defaultLocale: 'en',
  },
}
