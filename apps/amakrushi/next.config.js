/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa");
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer(
  withPWA({
    pwa: {
      dest: "public",
      register: true,
      skipWaiting: true,
    },
    env: {
      NEXT_PUBLIC_ENV: 'PRODUCTION', // your next configs go here
    },
    reactStrictMode: false,
    typescript: {
      ignoreBuildErrors: true,    
    },
    compiler: {
      removeConsole:  false
    },
    i18n: {
      locales: ['or', 'en'],
      defaultLocale: 'en',
    },
  })
);
