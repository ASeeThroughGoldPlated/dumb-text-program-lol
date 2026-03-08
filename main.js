const {app, BrowserWindow, Menu, nativeTheme, ipcMain, dialog} = require('electron')
const path = require('node:path')
const fs = require("fs")

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
  }
  
  })


  win.removeMenu() // remove devtools
  win.loadFile('index.html')


  function test(){
    win.maximize();
    win.show();
  }

  // slight delay to make sure everything to do with theme loading initializes properly..
  let timer = setTimeout(function(){
    win.maximize();
    win.show();
  }, 2000)
  //can't seem to only run this after the texteditor.js stuff is finished loading.....? guess it just has to be a static delay.... ughh...
}

nativeTheme.themeSource = `light`



app.whenReady().then(() => {

  ipcMain.handle('readFile', async (event, filename) => {
    let result = fs.readFileSync(filename, 'utf8')
    return result
  })

  ipcMain.handle('writeFile', async (event, filename, content) => {
    fs.writeFileSync(filename, content, 'utf8')
  })

  ipcMain.handle('readDir', async (event, directory) => {
    let result = fs.readdirSync(directory, 'utf8')
    return result
  })

  ipcMain.handle('isDir', async (event, directory) => {
    let result = fs.lstatSync(directory).isDirectory()
    return result
  })


  ipcMain.handle('fileExplorer', async (event) => {
    let selection = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
    return selection.filePaths[0].replaceAll(`\\`, "/")
  })


  ipcMain.handle('deleteFile', async (event, filename) => {
    fs.rename(filename, "Trash/" + filename.split("/")[filename.split("/").length - 1],
      (err => {
          if (err){
            console.log(err)
            // if there's an error... just assume the error is that there's already a directory by that name in Trash/... yeah ik it sucks. whatever.
            if(fs.lstatSync(filename).isDirectory() == true){

              fs.rmSync("Trash/" + filename.split("/")[filename.split("/").length - 1], { recursive: true })
              fs.renameSync(filename, "Trash/" + filename.split("/")[filename.split("/").length - 1]);
            }
        }
          else {
              
          }
      }));
    
  })

  ipcMain.handle('renameFile', async (event, old_name, new_name) => {
    fs.rename(old_name, new_name,
      (err => {
          if (err) console.log(err);
          else {

          }
      }));
  })


  ipcMain.handle('createDir', async (event, dir_name) => {
    fs.mkdir(dir_name,
    (err) => {
        if (err) {
            return console.error(err);
        }
    }); 
  })



  ipcMain.handle('channel1', async (event, argument) => {
    const result = argument
    return result
  })


  ipcMain.handle('rootDir', async (event) => {
    let meow = app.getPath('exe').replaceAll("\\", "/")

    let meh = ""
    for(let i = 0; i < meow.split("/").length - 1; i++){
        meh = meh + meow.split("/")[i] + "/"
    }

    if(meow.split("/")[7] == "dist"){
      return __dirname
    }else{
      return meh
    }
  })

  createWindow()


})

let app_path = app.getAppPath()