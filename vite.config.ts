import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import rehypeColorChips from './src/index';

export default defineConfig({
  root: 'demo',
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true
  },
  plugins: [
    mdx({
      development: true,
      rehypePlugins: [rehypeColorChips]
    }),
    react()
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mdx', '.md'],
  }
});
