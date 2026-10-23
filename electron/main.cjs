const { app, BrowserWindow, net, protocol } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const APP_SCHEME = "rent-unfiltered";
const APP_HOST = "bundle";

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
]);

function isInsideAppRoot(filePath, appRoot) {
  const normalizedRoot = path.resolve(appRoot);
  const normalizedFile = path.resolve(filePath);
  const relative = path.relative(normalizedRoot, normalizedFile);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function registerAppProtocol() {
  const appRoot = app.getAppPath();

  protocol.handle(APP_SCHEME, (request) => {
    let requestedUrl;
    try {
      requestedUrl = new URL(request.url);
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    if (requestedUrl.hostname !== APP_HOST || !["GET", "HEAD"].includes(request.method)) {
      return new Response("Not found", { status: 404 });
    }

    let relativePath;
    try {
      relativePath = decodeURIComponent(requestedUrl.pathname).replace(/^\/+/, "");
    } catch {
      return new Response("Bad request", { status: 400 });
    }
    if (!relativePath) relativePath = "index.html";

    const filePath = path.resolve(appRoot, relativePath);
    if (!isInsideAppRoot(filePath, appRoot)) {
      return new Response("Forbidden", { status: 403 });
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 980,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#ffffff",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event, target) => {
    try {
      const url = new URL(target);
      if (url.protocol !== `${APP_SCHEME}:` || url.hostname !== APP_HOST) {
        event.preventDefault();
      }
    } catch {
      event.preventDefault();
    }
  });

  window.once("ready-to-show", () => window.show());
  window.loadURL(`${APP_SCHEME}://${APP_HOST}/index.html`);
}

app.whenReady().then(() => {
  registerAppProtocol();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
