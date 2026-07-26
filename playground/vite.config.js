import { resolve } from 'node:path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

/** @type {import('vite').UserConfig} */
export default {
  base: './',
  build: {
    target: 'esnext',
    rolldownOptions: {
      input: {
        playground: resolve(import.meta.dirname, 'index.html')
      },
      output: {
        codeSplitting: {
          groups: [
            {
              test: /node_modules\/monaco-editor/,
              name: 'monaco-editor'
            }
          ]
        },
        assetFileNames: (assetInfo) => {
          const fontExtensions = ['.woff', '.woff2', '.eot', '.ttf', '.otf'];
          if (fontExtensions.some(ext => assetInfo.name.endsWith(ext))) {
            return 'assets/fonts/[name][extname]';
          }
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  },
  worker: {
    format: 'es',
    rolldownOptions: {
      output: {
        entryFileNames: (entryInfo) => {
          if (entryInfo.name.endsWith('.worker')) {
            return 'assets/monaco-[name]-[hash].js';
          }
          return 'assets/monaco-editor.worker-[hash].js';
        }
      }
    }
  },
  plugins: [
    {
      name: 'monaco-remove-worker-bundler-location',
      transform: {
        filter: {
          id: /editorWorkerService.js$/
        },
        handler (code) {
          const replaced = code.replace(/esmModuleLocationBundler:.*?\n/, '');
          if (replaced === code) {
            return;
          }

          return {
            code: replaced,
            map: null
          };
        }
      }
    },
    viteStaticCopy({
      targets: [
        {
          src: '../lib/vips.d.ts',
          dest: 'lib',
          rename: { stripBase: true }
        },
        {
          src: ['../lib/*.js', '!**/*-node*.js'],
          dest: 'lib',
          rename: { stripBase: true }
        },
        {
          src: '../lib/*.wasm',
          dest: 'lib',
          rename: { stripBase: true }
        }
      ]
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
};
