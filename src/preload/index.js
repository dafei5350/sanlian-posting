import { contextBridge, shell } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import PouchDB from "pouchdb";
import pouchdbFind from "pouchdb-find";
import fs from "fs";
import path from "path";
import https from "https";

PouchDB.plugin(pouchdbFind);
const db = new PouchDB(path.join(__dirname, "..", "img_database"));
const api = {
  downloadImage: function (url, path) {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          const fileStream = fs.createWriteStream(path);
          res.pipe(fileStream);
          fileStream.on("finish", () => {
            fileStream.close(resolve);
          });
          fileStream.on("error", reject);
        })
        .on("error", reject);
    });
  },
  fs: fs,
  shell: shell,
  db: {
    find: (query) => db.find(query),
    query: (mapFunction, reduceFunction, options) =>
      db.query(mapFunction, reduceFunction, options),
    put: (doc) => db.put(doc),
    get: (id) => db.get(id),
    remove: (doc) => db.remove(doc),
    allDocs: (options) => db.allDocs(options),
    destroy: () => db.destroy(),
    info: () => db.info(),
  },
};

// Expose protected methods that allow the renderer process to use
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
