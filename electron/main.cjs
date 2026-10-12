
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 900,
    minWidth: 800,
    minHeight: 700,
    backgroundColor: "#10051c",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Vite builds the app into the dist folder.
  // Electron Builder packages that folder inside app.asar.
  const indexPath = app.isPackaged
    ? path.join(app.getAppPath(), "dist", "index.html")
    : path.join(__dirname, "..", "dist", "index.html");

  win.loadFile(indexPath).catch((error) => {
    console.error("Magic Focus failed to load:", error);
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
