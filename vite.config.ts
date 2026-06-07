import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const pegaBaseUrl = env.VITE_PEGA_BASE_URL;
  const pegaTarget = pegaBaseUrl ? new URL(pegaBaseUrl) : null;
  const pegaProxyPath = pegaTarget?.pathname.split('/').filter(Boolean)[0];

  return {
    plugins: [react()],
    server: {
      port: 3502,
      proxy: pegaTarget && pegaProxyPath
        ? {
            [`/${pegaProxyPath}`]: {
              target: pegaTarget.origin,
              changeOrigin: true,
              secure: false
            }
          }
        : undefined
    }
  };
});
