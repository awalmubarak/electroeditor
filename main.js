const electron = require('electron')
const fs = require('fs')
const {app, BrowserWindow, ipcMain, dialog, Menu} = electron
let mainWindow
let currentPath
app.on('ready', ()=>{
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration:true
        }
    })
    mainWindow.loadFile('index.html')
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
});

ipcMain.on('save', (event, data)=>{
    if(currentPath===undefined){
        dialog.showSaveDialog(mainWindow, 
            {defaultPath:'filename.txt'}, (filepath)=>{
                currentPath=filepath
                if(filepath===undefined)return
                writeToFile(filepath, data)
            })
    }else{
        writeToFile(currentPath, data)
    }

});

function writeToFile(filePath, data){
    fs.writeFile(filePath, data, (err)=>{
        if(err) mainWindow.webContents.send('saved', {path: filePath, status: 'failed'});
        mainWindow.webContents.send('saved', {path: filePath, status: 'success'});     
    })
}

let menuTemplate = [
    process.platform=='darwin'?{
        label: app.getName(),
        submenu: [
            {role: 'about'},
            {role: 'hide'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {role: 'separator'},
            {role: 'quit'}
        ]
    }:{},
    
    {
        label: "File",
        submenu: [
            {label: "Save",
            click() {mainWindow.webContents.send('save-clicked')}
        },
            {label: "Save As",
            click() {
                currentPath = undefined
                mainWindow.webContents.send('save-clicked')
            }
        },
            
        ]
    }
]
