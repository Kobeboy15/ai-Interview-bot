/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    private_open_ai_key: process.env.OPENAI_API_KEY,
  },
};
export default nextConfig;
