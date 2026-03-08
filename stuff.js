
const fs = require("fs")
const path = require('path');



const {app, BrowserWindow, Menu, nativeTheme} = require('electron')

let file_list = document.getElementById("file_list")


// SAVE
document.getElementById("save").addEventListener('click', function(){

// `testfolder/` +
fs.writeFile(document.getElementById("filename").value + ".txt", document.getElementById("textarea").value, err => {
  if (err) throw err;
  console.log('The file has been saved!');
});

})

// LOAD
document.getElementById("load").addEventListener('click', function(){

    fs.readFile(document.getElementById("filename").value + ".txt", 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          document.getElementById("textarea").value = `ERR: NO_DATA`
          return;
        }
        console.log('File content:', data);
        document.getElementById("textarea").value = data
      });
    })



load_dir()
// load_dir(`testfolder`)
function load_dir(folder){

  console.log(folder)
  if(folder == undefined){


    // console.log("FOLDER IS UNDEFINED")

    let temp_folder = window.location.pathname.slice(0, -11).split('/')
    folder = `../` + temp_folder[temp_folder.length - 1].replaceAll("%20", " ")

    console.log(folder)
  }


  fs.readdir(folder + `/`, (err, files) => {
    files.forEach(file => {
      console.log(file);
  
      let bleh = document.createElement("li")
      bleh.innerHTML = file
  
      bleh.addEventListener("click", function(){
  
        fs.readFile(folder + `/` + file, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            document.getElementById("textarea").value = `ERR: NO_DATA`
            return;
          }
          console.log('File content:', data);
          document.getElementById("textarea").value = data
          document.getElementById("filename").value = folder + `/` + file
        });
  
      })
  
      file_list.appendChild(bleh)
  
    });
  });

}