import { defineConfig } from 'vite';
import {
  behaviorPacker as keystonePlugin,
  supportJsx,
} from 'keystonemc/vite-plugin';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    keystonePlugin({ uuid: "82b9174d-ea3d-42ae-986c-b42ce3644760" }),
    supportJsx(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
});
