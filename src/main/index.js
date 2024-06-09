import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  nativeImage,
  Tray,
  Menu,
  session,
} from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import AnyProxy from "anyproxy";
import WebSocket from "ws";
import { exec } from "child_process";

const WS_PORT = 8080;
const PROXY_PORT = 8001;
const WEB_INTERFACE_PORT = 8002;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    title: "三零发帖助手",
    resizable: false, // 禁止改变窗口大小
    fullscreenable: false, // 禁止全屏
    autoHideMenuBar: true,
    icon: join(__dirname, "../../resources/icon.png"),
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      contentSecurityPolicy:
        "default-src 'self'; script-src 'self' https://ssl.gstatic.com; img-src 'self' data: content: blob:;",
    },
  });
  app.commandLine.appendSwitch("proxy-server", "http://127.0.0.1:8001");
  mainWindow.on("ready", async () => {
    await session.defaultSession.setProxy({
      proxyRules: `http=localhost:${PROXY_PORT};https=localhost:${PROXY_PORT}`,
    });
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let tray;
app.whenReady().then(() => {
  createWindow();
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  const icon = nativeImage.createFromPath(
    join(__dirname, "../../resources/dock.png"),
  );
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Item3", type: "radio", checked: true },
    { label: "Item4", type: "radio" },
  ]);

  tray.setToolTip("This is my application.");
  tray.setContextMenu(contextMenu);
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("ping", () => console.log("pong11113333"));
  ipcMain.handle("get-user-info", async (event, token) => {
    try {
      const response = await axios.get(
        "http://data.lfxjpt.cn:8082/wsplatform/service/manager/user/info",
        {
          headers: {
            AccessToken: token,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  });
  ipcMain.handle("download-image", async (event, url) => {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      return response.data;
    } catch (error) {
      console.error(`Failed to download image: ${error}`);
      throw error;
    }
  });
  ipcMain.handle("posting-main", async (event, obj, token) => {
    try {
      const response = await axios.post(
        "http://data.lfxjpt.cn:8082/wsplatform/service/analysis/v1/wl/add",
        {
          ...obj,
        },
        {
          headers: {
            AccessToken: token,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to upload file: ${error}`);
      throw error;
    }
  });
  ipcMain.handle("upload-file", async (event, serializableData) => {
    try {
      const uploadUrl =
        "http://data.lfxjpt.cn:8082/wsplatform/service/analysis/v1/attachment/upload";
      const formData = new FormData();
      for (let key in serializableData) {
        if (key === "file") {
          const fileData = fs.createReadStream(serializableData[key].path);
          formData.append(key, fileData, serializableData[key].name);
        } else {
          formData.append(key, serializableData[key]);
        }
      }
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          event.sender.send("upload-progress", progress);
        },
      });
      event.sender.send("upload-success", response.data);
      return response.data;
    } catch (error) {
      event.sender.send(" upload-error", error.message);
      console.error(`Failed to upload file: ${error}`);
      throw error;
    }
  });
  const wss = new WebSocket.Server({ port: 8080 });
  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log("received: %s", message);
    });

    ws.send("something");
  });

  function createProxyServer() {
    const options = {
      rule: {
        *beforeSendRequest(requestDetail) {
          const newRequestOptions = requestDetail.requestOptions;
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(newRequestOptions));
            }
          });
          yield newRequestOptions;
          return {
            requestOptions: newRequestOptions,
          };
        },
        // *beforeSendResponse(requestDetail, responseDetail) {
        //   if (requestDetail.url.indexOf("http://data.lfxjpt.cn:8082") > -1) {
        //     const newResponse = responseDetail.response;
        //     newResponse.body += "this is a response body";
        //     return {
        //       response: newResponse,
        //     };
        //   }
        // },
      },
      port: PROXY_PORT,
      webInterface: {
        enable: true,
        webPort: WEB_INTERFACE_PORT,
      },
      throttle: 10000,
      forceProxyHttps: true,
      wsIntercept: true,
      silent: true,
    };
    const proxyServer = new AnyProxy.ProxyServer(options);
    proxyServer.start();
  }

  function generateRootCA() {
    if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
      AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
        if (!error) {
          const certDir = path.dirname(keyPath);
          console.log("The cert is generated at", certDir);
          const isWin = /^win/.test(process.platform);
          const openCmd = isWin ? "start" : "open";
          exec(`${openCmd} ${certDir}`);
        } else {
          console.error("Failed to generate rootCA", error);
        }
      });
    }
  }
  function startHttpsServer() {
    exec(
      `netsh winhttp set proxy proxy-server="http=127.0.0.1:${PROXY_PORT};https=127.0.0.1:${PROXY_PORT}" bypass-list="*.example.com"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error starting HTTPS server: ${error}`);
          return;
        }

        if (stderr) {
          console.error(`Error starting HTTPS server: ${stderr}`);
          return;
        }

        console.log(`HTTPS server started: ${stdout}`);
      },
    );
  }
  startHttpsServer();
  createProxyServer();
  generateRootCA();

  app.on(
    "certificate-error",
    (event, webContents, url, error, certificate, callback) => {
      event.preventDefault();
      callback(true);
    },
  );
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
