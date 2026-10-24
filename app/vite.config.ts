import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import messages from './locales/fr/ui.json' with { type: 'json' };

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (value) => `&#${value.charCodeAt(0)};`);

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'atlas-text-resources',
      transformIndexHtml(html) {
        return html.replace(/__ATLAS_TEXT_([\w.]+)__/g, (_match, key: string) => {
          const message = messages[key as keyof typeof messages];
          if (typeof message !== 'string') throw new Error('ui.missingBootstrapResource');
          return escapeHtml(message);
        });
      },
    },
  ],
  base: './',
  build: { sourcemap: false, copyPublicDir: mode !== 'atlas-stage' },
}));
