import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Replaces any noindex/nofollow robots meta tag injected by the build pipeline
function enforceIndexable(): Plugin {
  return {
    name: 'enforce-indexable',
    transformIndexHtml(html: string) {
      // Replace any noindex or nofollow robots meta with index, follow
      return html.replace(
        /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?>/gi,
        '<meta name="robots" content="index, follow" />'
      );
    },
  };
}


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    enforceIndexable(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
