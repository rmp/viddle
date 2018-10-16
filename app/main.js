const electron = require('electron');
// Module to control application life.
const { ipcMain } = require('electron');
const { spawn }   = require("child_process");
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const os    = require('os');
const path  = require('path');
const url   = require('url');
const utils = [
    path.join(__dirname, "utils", os.platform()),
    "/usr/local/bin",
    "/opt/local/bin",
    "/usr/bin",
    "/bin"].join(path.delimiter);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('fetch', (event, url, opts) => {
    let args = [];
    console.log(opts);
    Object.keys(opts).forEach((o) => {
	if(typeof opts[o] === 'boolean') {
	    if(opts[o]) {
		args.push(`--${o}`);
	    }
	} else {
	    args.push(`--${o}`, opts[o]);
	}
    });
    console.log(url, ...args);
    let runner = spawn("youtube-dl", [url, ...args], {
	cwd: path.join(os.homedir(), "Desktop"),
	env: { PATH: utils }
    });
    runner.stdout.on("data", buf => {
	event.sender.send("stdout", buf.toString().trim().split(/[\r\n]+/)[0]); // lazy only take first line
    });
    runner.stderr.on("data", buf => {
	event.sender.send("stderr", buf.toString().trim().split(/[\r\n]+/)[0]); // lazy only take first line
    });
    runner.on("close", code => {
        event.sender.send("exit", code);
    });
})
