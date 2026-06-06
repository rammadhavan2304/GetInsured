import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const pegaBaseUrl = env.VITE_PEGA_BASE_URL;

  return {
    plugins: [react()],
    server: {
      port: 3502,
      proxy: pegaBaseUrl
        ? {
            '/prweb': {
              target: pegaBaseUrl,
              changeOrigin: true,
              secure: false
            }
          }
        : undefined
    }
  };
});
