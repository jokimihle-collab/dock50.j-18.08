import { defineConfig } from "vite";
import { resolve } from "path";
import viteImagemin from "vite-plugin-imagemin";

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 3 },
      mozjpeg: { quality: 75 },
      pngquant: { quality: [0.65, 0.8] },
      svgo: { plugins: [{ name: "removeViewBox", active: false }] },
      webp: { quality: 75 },
    }),
  ],
  server: {
    port: 5174,
  },
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, "index.html"),
        anfrage: resolve(__dirname, "anfrage.html"),
        event:   resolve(__dirname, "event.html"),
        "404":   resolve(__dirname, "404.html"),
        impressum: resolve(__dirname, "impressum.html"),
        datenschutz: resolve(__dirname, "datenschutz.html"),
      },
    },
  },
});
