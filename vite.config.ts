import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import site from './site.json' with { type: 'json' }

function siteOrigin(): Plugin {
  return {
    name: 'site-origin',
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_ORIGIN%', site.origin)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteOrigin()],
  server: {
    port: 5185,
    strictPort: true
  }
})
