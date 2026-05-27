import { defineConfig } from "vite";
import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";
import viteImagemin from "vite-plugin-imagemin";

function updatePastEvents() {
  const FILE = "src/events.js";
  const content = readFileSync(FILE, "utf-8");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function parseDate(str) {
    const [d, m, y] = str.split(".").map(Number);
    return new Date(2000 + y, m - 1, d);
  }

  let count = 0;
  const updated = content.replace(
    /date:\s*"(\d{2}\.\d{2}\.\d{2})",\s*past:\s*false/g,
    (match, dateStr) => {
      if (parseDate(dateStr) < today) {
        count++;
        return match.replace("past: false", "past: true");
      }
      return match;
    }
  );

  if (count > 0) writeFileSync(FILE, updated, "utf-8");
}

const pastEventsPlugin = {
  name: "update-past-events",
  handleHotUpdate({ server }) {
    updatePastEvents();
    server.ws.send({ type: "full-reload" });
    return [];
  },
  buildStart() {
    updatePastEvents();
  },
};

export default defineConfig({
  plugins: [
    pastEventsPlugin,
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
      },
    },
  },
});
