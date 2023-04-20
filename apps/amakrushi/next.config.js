/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  compiler: {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    removeConsole:  process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENV === "PRODUCTION"
  },
}
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  enabled: process.env.ANALYZE === 'true'
})



module.exports = withBundleAnalyzer({
  env: {
      NEXT_PUBLIC_ENV: 'PRODUCTION', //your next configs goes here
  },
  nextConfig,
  typescript: {
    ignoreBuildErrors: true,    
  },
  i18n: {
    locales: ['or','en'],
    defaultLocale: 'en',
  }
})