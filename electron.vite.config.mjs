import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import VueDevTools from "vite-plugin-vue-devtools";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ["pouchdb", "pouchdb-find"],
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [vue(), VueDevTools()],
  },
});
