import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'api-dev-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && (req.url.startsWith('/api/og') || req.url.startsWith('/api/snapshot'))) {
              try {
                // Polyfill status and json for Node http.ServerResponse if needed
                if (!(res as any).status) {
                  (res as any).status = function (code: number) {
                    this.statusCode = code;
                    return this;
                  };
                }
                if (!(res as any).json) {
                  (res as any).json = function (data: any) {
                    this.setHeader('Content-Type', 'application/json');
                    this.end(JSON.stringify(data));
                  };
                }

                if (req.url.startsWith('/api/og')) {
                  const { default: handler } = await server.ssrLoadModule('/api/og.ts');
                  return handler(req, res);
                }

                if (req.url.startsWith('/api/snapshot')) {
                  const { default: handler } = await server.ssrLoadModule('/api/snapshot.ts');
                  return handler(req, res);
                }
              } catch (err) {
                console.error('API Dev Middleware Error:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
                return;
              }
            }
            next();
          });
        },
      },
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
  };
});
