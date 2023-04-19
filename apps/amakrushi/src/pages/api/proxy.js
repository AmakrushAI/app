const { createProxyMiddleware } = require('http-proxy-middleware');

// Create a proxy middleware instance
const proxy = createProxyMiddleware({
  target: process.env.NEXT_PUBLIC_FEEDBACK_URL,
  changeOrigin: true,
});

export default proxy;