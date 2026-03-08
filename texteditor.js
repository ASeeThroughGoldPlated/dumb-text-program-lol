// Variables setup

// elements
let textarea = document.getElementById("textarea")
let passage_title = document.getElementById("passage_title")
let folder_list = document.getElementById("folder_list")
let file_list = document.getElementById("file_list")
let toast = document.getElementById("toast")
let button_themeLink = document.getElementById("theme_link")
let tab_container = document.getElementById("tab_container")
let bg_list = document.getElementById("background_list")
let bg_list_container = document.getElementById("background_list_container")
let file_browser = document.getElementById("file_browser")
let theme_editor = document.getElementById("theme_editor")
const contextMenu = document.getElementById("contextMenu")
const theme_dropdown_menu = document.getElementById("theme_dropdown")


// idk
let main_left = document.getElementById("main").style.left.slice(0,-2)
let main_top = document.getElementById("main").style.top.slice(0,-2)
let thingy = document.getElementById("main")


const tab_closed = "214px"
const tab_opened = "25px"

tab_container.style.left = "214px"
// 

let file_selected = `BLANK`

let file_rightclick = `BLANK2`



let temp_thingy = window.location.pathname.slice(0, -11).split('/')
let root = `../` + temp_thingy[temp_thingy.length - 1].replaceAll("%20", " ") + "/"

root = 'Files/'
let current_dir = root

let config = {
    "loadedTheme":"EMPTY"
}

const initial_template = `:root{
    --primary-background:rgba(184, 184, 184, 0.7);
    --primary-text:rgba(255, 255, 255, 1);
    --primary-border:rgba(143, 143, 143, 0.8);
    --primary-header:rgba(154, 159, 165, 1);
    --header-text:rgba(255, 255, 255, 1);

    --text-background:rgba(143, 143, 143, 0.6);
    --text-border:rgba(219, 219, 219, 1);
    --text-color:rgb(255, 255, 255, 1);
    
    --locked:false;
}
`

var r = document.querySelector(':root');
var rs = getComputedStyle(r);


let dir_array = "undefinedddd"

let root_dir
// -------




// HEX to RGB / RGB to HEX... code from online
const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
const rgbToHex = (r, g, b) => {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const hex2rgb = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if(alpha != undefined){
        return "rgba(" + r + ', ' + g + ', ' + b + ", " + alpha + ")"
    }else{
        return "rgb(" + r + ', ' + g + ', ' + b + ")"
    }
}



function prompt_cancel(){
    document.getElementById("prompt_container").style.visibility = "hidden"
}






const file_load = async () => {
    document.getElementById("prompt_container").style.visibility = "hidden"

    if(current_dir == undefined){
        let result = await window.ipc.readFile(file_selected + ".txt")
        document.getElementById("textarea").value = result
        document.getElementById("passage_title").innerHTML = file_selected
    }else{
        let result = await window.ipc.readFile(current_dir + file_selected + ".txt")
        document.getElementById("textarea").value = result
        document.getElementById("passage_title").innerHTML = file_selected
    }
    textarea.disabled = false
}







const file_create = async () => {
    let name = document.getElementById("prompt_input").value

    document.getElementById("prompt_container").style.visibility = "hidden"

    if(document.getElementById("span_type").innerHTML == "Folder"){
        await window.ipc.createDir(current_dir + document.getElementById("prompt_input").value)
    }else{
        await window.ipc.writeFile(current_dir + document.getElementById("prompt_input").value + ".txt", "placeholder: " + document.getElementById("prompt_input").value)
    }

    load_dir(current_dir, "reload")
    if(document.getElementById("span_type").innerHTML == "File"){
        toast_notif("Created " + document.getElementById("prompt_input").value + ".txt!")
    }else{
        toast_notif("Created " + document.getElementById("prompt_input").value)
    }
}




// KEYBIND STUFF

let ctrl_held = false
textarea.addEventListener('keydown', function(){
    if(event.key == "s" && event.ctrlKey == true){
        prompt("file_save", file_selected)
    }
})


document.addEventListener('keydown', function(){
    if(event.key == "Escape" && document.getElementById("prompt_container").style.visibility == "visible"){
        prompt_cancel()
    }
})

document.addEventListener('keyup', function(){
   if(document.getElementById("prompt_container").style.visibility == "visible"){
    if(event.key == "Enter"){
        document.getElementById("prompt_confirm").click()
        }
   }
})






// splits up dir_array into a folders array and files array...
const sort_fileTypes = async (directory) => {

    let files = []
    let folders = []

    for(let i = 0; i < directory.length; i++){
        if(directory[i].slice(-4) != ".txt"){

            // LOADING SUBFOLDERS
            let isdir = await window.ipc.isDir(current_dir + directory[i])

            if(isdir == true){
                folders.push(directory[i])
            }
            continue
        }
        files.push(directory[i])
}

init_fileList("folder_list", folders)
init_fileList("file_list", files)
}



// file browser init
function init_fileList(category, list){
    
// this is a mess lmao I kinda forget how this even works
let ul = document.getElementById(category)

for(let i = 0; i < list.length; i++){
    let bleh = document.createElement("li")
    bleh.innerHTML = list[i]
    ul.appendChild(bleh)

    if(list[i].length >= 27){
        bleh.classList.add("list_overflow")
    }

    
    if(category == "file_list"){

    // left click
      bleh.addEventListener("click", function(){
        prompt("file_load", list[i].slice(0,-4))
      })


    // right click
      bleh.addEventListener('contextmenu', (event) => {
        event.preventDefault()

        file_contextMenu(list[i], event)

        for(let i = 0; i < document.getElementsByClassName("list_selected").length; i++){
            document.getElementsByClassName("list_selected")[i].classList.remove("list_selected")
        }
        event.target.classList.add("list_selected")
        file_rightclick = list[i]
    })

    }

    if(category == "folder_list"){
        bleh.addEventListener("click", function(){
            load_dir(list[i])
          })

          bleh.addEventListener('contextmenu', (event) => {
            event.preventDefault()

            file_contextMenu(list[i], event)

            for(let i = 0; i < document.getElementsByClassName("list_selected").length; i++){
                document.getElementsByClassName("list_selected")[i].classList.remove("list_selected")
            }
            event.target.classList.add("list_selected")
            file_rightclick = list[i]
        })
    }

}
}



// navigating up in file browser
function directory_up(){

    let meh = ""
    for(let i = 0; i < current_dir.split("/").length - 2; i++){
        meh = meh + current_dir.split("/")[i] + "/"
    }

    load_dir(meh, "up")
}


// loading file browser...
const load_dir = async (folder, mode) =>{
    
    folder_list.innerHTML = ""
    file_list.innerHTML = ""

  if(folder == undefined){
    console.log("folder undefined")
    return
  }else{

    // just making sure that it ends in a /... idk
    if(folder.slice(-1) != "/"){
        folder = folder + "/"
    }


    // if it's a subfolder, add back button
    if(folder != root){

        if(mode != "reload"){

            if(mode == "up"){

                current_dir = folder

            }else{
                current_dir = current_dir + folder
            }

        }

    }else{
        current_dir = root
    }

  }

document.getElementById("file_title").innerHTML = ""
for(let i = 0; i < current_dir.split("/").length - 1; i++){
    let block = document.createElement("div")
    block.classList.add("filetitle_block")

    block.innerHTML = current_dir.split("/")[i]

    document.getElementById("file_title").appendChild(block)

    block.addEventListener("click", function(){


        let destination = ""

        for(let i = 0; i < Array.from(this.parentElement.getElementsByClassName("filetitle_block")).indexOf(this) + 1; i++){
            destination = destination + current_dir.split("/")[i] + "/"
        }
        load_dir(destination, "up")

    })

    if(i != current_dir.split("/").length - 2){
    let divider = document.createElement("div")
    divider.classList.add("filetitle_divider")
    divider.innerHTML = ">"
    document.getElementById("file_title").appendChild(divider)
    }
}


if(document.getElementById("file_title").getBoundingClientRect().width >= 170){
    document.getElementById("file_title").classList.add("filetitle_overflowing")
}else{
    document.getElementById("file_title").classList.remove("filetitle_overflowing")
}


// populating list
dir_array = await window.ipc.readDir(current_dir)

sort_fileTypes(dir_array)

}





const file_save = async () => {
    if(current_dir == undefined){
        await window.ipc.writeFile(file_selected + '.txt', document.getElementById("textarea").value)
    }else{
        await window.ipc.writeFile(current_dir + file_selected + '.txt', document.getElementById("textarea").value)
    }
    document.getElementById("prompt_container").style.visibility = "hidden"
    toast_notif("Saved " + file_selected + ".txt!")
}



// is this used...?
function open_folder(folder){
    load_dir(folder)
}





// ::side tab stuff


function tab_open(){
    document.getElementById("tab_left").classList.add("clickable")
    document.getElementById("tab_triangle").classList.add("clickable")
    document.getElementById("tab_left").addEventListener("click", tab_close)
    document.getElementById("tab_triangle").addEventListener("click", tab_close)
}

function tab_close(){
    tab_container.style.left = tab_closed
    document.getElementById("theme_dropdown").style.visibility = "hidden"
    document.getElementById("menu_arrow").src = "icon_arrow_down.png"

    document.getElementById("tab_left").classList.remove("clickable")
    document.getElementById("tab_triangle").classList.add("clickable")
    document.getElementById("tab_left").removeEventListener("click", tab_close)
    document.getElementById("tab_triangle").removeEventListener("click", tab_close)

    document.getElementById("icon_file").classList.remove("icon_active")
    document.getElementById("icon_theme").classList.remove("icon_active")
}


function filelist_toggle(){

    if(tab_container.style.left == tab_opened){

        if(theme_editor.style.display == "block"){
            file_browser.style.display = "block"
            theme_editor.style.display = "none"
            document.getElementById("icon_file").classList.add("icon_active")
            document.getElementById("icon_theme").classList.remove("icon_active")
        }else{
            tab_close()
        }
        
    }else{
        tab_container.style.left = tab_opened
        file_browser.style.display = "block"
        theme_editor.style.display = "none"
        document.getElementById("icon_file").classList.add("icon_active")
        document.getElementById("icon_theme").classList.remove("icon_active")
        tab_open()
    }

}

function theme_toggle(){

    if(tab_container.style.left == tab_opened){

        if(file_browser.style.display == "block"){
            theme_editor.style.display = "block"
            file_browser.style.display = "none"

            document.getElementById("icon_file").classList.remove("icon_active")
            document.getElementById("icon_theme").classList.add("icon_active")

        }else{
            tab_close()
        }
        
    }else{
        tab_container.style.left = tab_opened
        theme_editor.style.display = "block"
        file_browser.style.display = "none"

        document.getElementById("icon_file").classList.remove("icon_active")
        document.getElementById("icon_theme").classList.add("icon_active")
        tab_open()
    }

}




// ::theme stuff


// loading background pics
function load_background(img){
    console.log("loading bg: " + img)
    console.log(img.slice(0, 1))

    // in case the .css has "" surrounding the background-image property...
    if(img.slice(0, 1) == `"`){
        img = img.split(`"`)[1]
    }
    document.body.style.backgroundImage = ``
    document.body.style.backgroundImage = `url('` + img + `')`
}



const change_css = async () => {

    if(document.getElementById("css_select").value == ""){
        console.log("guh")
        return
    }

    document.documentElement.style = ""
    document.getElementById("theme").href = root_dir + "/themes/" + document.getElementById("css_select").value + ".css"


    let temp = await read_css(root_dir + "/themes/" + document.getElementById("css_select").value + ".css")

    let keys = Object.keys(temp)
    let values = Object.values(temp)

    update_inputs(temp)

    config.loadedTheme = document.getElementById("css_select").value
    config_update()
    return

}

function update_inputs(theme){

    if(theme.locked == "true"){
        document.getElementById("button_lock").src = "icon_locked.png"
        document.getElementById("css_save").classList.add("button_disabled")
        document.getElementById("color_select").classList.add("inputs_locked")

        document.getElementById("theme_bg").classList.add("button_disabled")
        document.getElementById("theme_link").classList.add("button_disabled")

        document.getElementById("list_cssRename").classList.add("menu_locked")
        document.getElementById("list_cssDelete").classList.add("menu_locked")
    }else{
        document.getElementById("button_lock").src = "icon_unlocked.png"
        document.getElementById("css_save").classList.remove("button_disabled")
        document.getElementById("color_select").classList.remove("inputs_locked")

        document.getElementById("theme_bg").classList.remove("button_disabled")
        document.getElementById("theme_link").classList.remove("button_disabled")

        document.getElementById("list_cssRename").classList.remove("menu_locked")
        document.getElementById("list_cssDelete").classList.remove("menu_locked")
    }


    for(let i = 0; i < document.getElementById("color_select").getElementsByClassName("input_color").length; i++){

        document.getElementsByClassName("input_color")[i].value = rgbToHex(
        Number(theme[document.getElementById("color_select").getElementsByClassName("input_color")[i].id].split("(")[1].split(",")[0]),
        Number(theme[document.getElementById("color_select").getElementsByClassName("input_color")[i].id].split("(")[1].split(",")[1]),
        Number(theme[document.getElementById("color_select").getElementsByClassName("input_color")[i].id].split("(")[1].split(",")[2])
        )


    }
    // opacity
    for(let i = 0; i < document.getElementById("color_select").getElementsByClassName("input_range").length; i++){


        document.getElementById("color_select").getElementsByClassName("input_range")[i].value = Number(theme[document.getElementById("color_select").getElementsByClassName("input_color")[i].id].slice("0", "-1").slice("5").split(",")[3])

        document.getElementById("color_select").getElementsByClassName("square_opacity")[i].style.filter = "opacity(" + document.getElementById("color_select").getElementsByClassName("input_range")[i].value + ")"

    }

    if(theme["background-img"] != undefined){
        load_background(theme["background-img"])
        button_themeLink.classList.add("button_pressed")
        button_themeLink.src = `icon_link_small_true.png`
    }else{
        button_themeLink.classList.remove("button_pressed")
        button_themeLink.src = `icon_link_small.png`
    }


}



// p sure this is unused now..?
function refresh_colorSelect(){

    if(rs.getPropertyValue("--locked") == "true"){
        document.getElementById("button_lock").src = "icon_locked.png"
        document.getElementById("css_save").classList.add("button_disabled")
        document.getElementById("color_select").classList.add("inputs_locked")

        document.getElementById("theme_bg").classList.add("button_disabled")
        document.getElementById("theme_link").classList.add("button_disabled")

        document.getElementById("list_cssRename").classList.add("menu_locked")
        document.getElementById("list_cssDelete").classList.add("menu_locked")
    }else{
        document.getElementById("button_lock").src = "icon_unlocked.png"
        document.getElementById("css_save").classList.remove("button_disabled")
        document.getElementById("color_select").classList.remove("inputs_locked")

        document.getElementById("theme_bg").classList.remove("button_disabled")
        document.getElementById("theme_link").classList.remove("button_disabled")

        document.getElementById("list_cssRename").classList.remove("menu_locked")
        document.getElementById("list_cssDelete").classList.remove("menu_locked")
    }

    for(let i = 0; i < document.getElementById("color_select").getElementsByClassName("input_color").length; i++){
        document.getElementsByClassName("input_color")[i].value = rgbToHex(Number(rs.getPropertyValue("--" + document.getElementById("color_select").getElementsByClassName("input_color")[i].id).split("(")[1].split(",")[0]), Number(rs.getPropertyValue("--" + document.getElementById("color_select").getElementsByClassName("input_color")[i].id).split("(")[1].split(",")[1]), Number(rs.getPropertyValue("--" + document.getElementById("color_select").getElementsByClassName("input_color")[i].id).split("(")[1].split(",")[2]))
    }
    // opacity
    for(let i = 0; i < document.getElementById("color_select").getElementsByClassName("input_range").length; i++){


        document.getElementById("color_select").getElementsByClassName("input_range")[i].value = Number(rs.getPropertyValue("--" + document.getElementById("color_select").getElementsByClassName("input_color")[i].id).slice("0", "-1").slice("5").split(",")[3])

        document.getElementById("color_select").getElementsByClassName("square_opacity")[i].style.filter = "opacity(" + document.getElementById("color_select").getElementsByClassName("input_range")[i].value + ")"

    }
    if(rs.getPropertyValue("--background-img") != ""){
        load_background(rs.getPropertyValue("--background-img"))
        button_themeLink.classList.add("button_pressed")
        button_themeLink.src = `icon_link_small_true.png`
    }else{
        button_themeLink.classList.remove("button_pressed")
        button_themeLink.src = `icon_link_small.png`
    }

}

let theme_list = []

const init_cssList = async (blank) => {

    let css_list = document.getElementById("css_select")
    css_list.innerHTML = ""


    let list = await window.ipc.readDir("themes/")

    for(let i = 0; i < list.length; i++){

            if(list[i].slice("-4") != ".css"){
                return
            }
            let new_css = document.createElement("option")

            new_css.innerHTML = list[i].slice(0,"-4")

            css_list.append(new_css)
        }

        if(blank != undefined){

            if(blank == true){
                document.getElementById("css_select").value = "DELETED"
                // ?
            }else{
                document.getElementById("css_select").value = blank
                change_css(blank)
            }
        }

    theme_list = list
}


const save_css = async (locked, silent) => {

let template = `:root{
    --primary-background:` + hex2rgb(document.getElementById("primary-background").value, document.getElementById("primary-background-opacity").value) + `;
    --primary-text:` + hex2rgb(document.getElementById("primary-text").value, document.getElementById("primary-text-opacity").value) + `;
    --primary-border:` + hex2rgb(document.getElementById("primary-border").value, document.getElementById("primary-border-opacity").value) + `;
    --primary-header:` + hex2rgb(document.getElementById("primary-header").value, document.getElementById("primary-header-opacity").value) + `;
    --header-text:` + hex2rgb(document.getElementById("header-text").value, document.getElementById("header-text-opacity").value) + `;
  
    --text-background:` + hex2rgb(document.getElementById("text-background").value, document.getElementById("text-background-opacity").value) + `;
    --text-border:` + hex2rgb(document.getElementById("text-border").value, document.getElementById("text-border-opacity").value) + `;
    --text-color:` + hex2rgb(document.getElementById("text-color").value, document.getElementById("header-text-opacity").value) + `;
    `

if(locked == true){
template = template + `--locked:true;
`
}else{
template = template + `--locked:false;
` 
}


if(button_themeLink.classList.contains("button_pressed") == true && document.body.style.backgroundImage != ""){
console.log("saved theme with linked background")
template = template + `--background-img:"` + document.body.style.backgroundImage.split(`"`)[1] + `";
` 
}
template = template + `}`


    await window.ipc.writeFile("themes/" + document.getElementById("css_select").value + ".css", template)

    if(silent != "silent"){
        toast_notif("saved theme: " + document.getElementById("css_select").value + "!")
    }
}



// ONCHANGE COLOR INPUTS
for(let i = 0; i < document.getElementById("color_select").getElementsByClassName("input_color").length; i++){

    document.getElementById("color_select").getElementsByClassName("input_color")[i].addEventListener('input', function(){
      
        r.style.setProperty("--" + document.getElementById("color_select").getElementsByClassName("input_color")[i].id, hex2rgb(this.value, document.getElementById("color_select").getElementsByClassName("input_range")[i].value))

    })
}


// onchange opacity
for(let i = 0; i < document.getElementById("color_select").getElementsByClassName("input_range").length; i++){

    document.getElementById("color_select").getElementsByClassName("input_range")[i].addEventListener('input', function(){

        r.style.setProperty("--" + document.getElementById("color_select").getElementsByClassName("input_color")[i].id, hex2rgb(document.getElementById("color_select").getElementsByClassName("input_color")[i].value, document.getElementById("color_select").getElementsByClassName("input_range")[i].value))


        document.getElementById("color_select").getElementsByClassName("square_opacity")[i].style.filter = "opacity(" + document.getElementById("color_select").getElementsByClassName("input_range")[i].value + ")"

    })
}



const create_css = async () => {
    let name = document.getElementById("prompt_input").value


let template = initial_template

    document.getElementById("prompt_container").style.visibility = "hidden"

    await window.ipc.writeFile("themes/" + name + ".css", template)

let delay = setTimeout(function(){
    init_cssList(name)
    refresh_colorSelect()
}, 5)


}






function lock_toggle(){
    let lock_img = document.getElementById("button_lock")
    console.log("lock_toggle")


    if(rs.getPropertyValue("--locked") == "false"){

        r.style.setProperty('--locked', "true");

        console.log(rs.getPropertyValue("--locked"))
        document.getElementById("list_cssRename").classList.add("menu_locked")
        document.getElementById("list_cssDelete").classList.add("menu_locked")

        save_css(true, "silent")
    }else{

        r.style.setProperty('--locked', "false");

        document.getElementById("list_cssRename").classList.remove("menu_locked")
        document.getElementById("list_cssDelete").classList.remove("menu_locked")

        save_css(false, "silent")
    }

    refresh_colorSelect()

}



const bg_select = async () => {
    let bg_selected = await window.ipc.fileExplorer()
    load_background(bg_selected)
}

function theme_link(){
    if(button_themeLink.classList.contains("button_pressed") != true){
        button_themeLink.classList.add("button_pressed")
        button_themeLink.src = `icon_link_small_true.png`
    }else{
        button_themeLink.classList.remove("button_pressed")
        button_themeLink.src = `icon_link_small.png`
    }
}





const theme_delete = async () => {
    document.getElementById("prompt_container").style.visibility = "hidden"
    await window.ipc.deleteFile("themes/" + document.getElementById("css_select").value + ".css")
    toast_notif("Deleted " + document.getElementById("css_select").value + ".css")
    init_cssList(true)
}



const theme_rename = async () => {
    await window.ipc.renameFile("themes/" + document.getElementById("css_select").value + ".css", "themes/" + document.getElementById("prompt_input").value + ".css")
    document.getElementById("prompt_container").style.visibility = "hidden"
    toast_notif("Rename complete!")
    init_cssList(document.getElementById("prompt_input").value)
}

function theme_dropdown(){
    if(document.getElementById("theme_dropdown").style.visibility == "hidden"){
        document.getElementById("theme_dropdown").style.visibility = "visible"
        document.getElementById("menu_arrow").src = "icon_arrow.png"

        let delay = setTimeout(function(){
            theme_eventListener = document.addEventListener("click", themeEvent)
        }, 1)

    }else{
        document.removeEventListener("click", themeEvent)
        document.getElementById("theme_dropdown").style.visibility = "hidden"
        document.getElementById("menu_arrow").src = "icon_arrow_down.png"
    }

}

function themeEvent(event){
    if(event.target != document.getElementById("theme_dropdown") && event.target.parentElement != document.getElementById("theme_dropdown")){
        document.getElementById("theme_dropdown").style.visibility = "hidden"
        document.getElementById("menu_arrow").src = "icon_arrow_down.png"
        document.removeEventListener("click", themeEvent)
    }
}


const create_css_dupe = async () => {
    let template = `:root{
        --primary-background:` + hex2rgb(document.getElementById("primary-background").value, document.getElementById("primary-background-opacity").value) + `;
        --primary-text:` + hex2rgb(document.getElementById("primary-text").value, document.getElementById("primary-text-opacity").value) + `;
        --primary-border:` + hex2rgb(document.getElementById("primary-border").value, document.getElementById("primary-border-opacity").value) + `;
        --primary-header:` + hex2rgb(document.getElementById("primary-header").value, document.getElementById("primary-header-opacity").value) + `;
        --header-text:` + hex2rgb(document.getElementById("header-text").value, document.getElementById("header-text-opacity").value) + `;
      
        --text-background:` + hex2rgb(document.getElementById("text-background").value, document.getElementById("text-background-opacity").value) + `;
        --text-border:` + hex2rgb(document.getElementById("text-border").value, document.getElementById("text-border-opacity").value) + `;
        --text-color:` + hex2rgb(document.getElementById("text-color").value, 1) + `;
        --locked:false;
        `

    if(button_themeLink.classList.contains("button_pressed") == true && document.body.style.backgroundImage != ""){
    template = template + `--background-img:"` + document.body.style.backgroundImage.split(`"`)[1] + `";
    ` 
    }
    template = template + `}`

    let name = document.getElementById("prompt_input").value

    document.getElementById("prompt_container").style.visibility = "hidden"

    await window.ipc.writeFile("themes/" + name + ".css", template)



let delay = setTimeout(function(){
    init_cssList(name)
    refresh_colorSelect()
}, 5)


}





// event listener for closing opacity slider when clicking elsewhere
document.addEventListener('click', function(){

    if(event.target.classList.contains("popup_opacity") || event.target.classList.contains("square_opacity") || event.target.type == "range"){
        return
    }else{
        for(let i = 0; i < document.getElementsByClassName("popup_opacity").length; i++){
            document.getElementsByClassName("popup_opacity")[i].style.display = "none"
        }
        // ...shouldn't be running this much code on EVERY mouseclick... should prob create this eventlistener when you enable editing and delete it after or something.
    }
})


function popup_opacity(thingy){

    if(document.getElementById("popup_" + thingy + "-opacity").style.display == "block"){
        document.getElementById("popup_" + thingy + "-opacity").style.display = "none"
        return
    }

    for(let i = 0; i < document.getElementsByClassName("popup_opacity").length; i++){
        document.getElementsByClassName("popup_opacity")[i].style.display = "none"
    }

    document.getElementById("popup_" + thingy + "-opacity").style.display = "block"

}










const config_update = async () => {
    await window.ipc.writeFile("config.json", JSON.stringify(config))
}



function text_opacity(){

    let rgb = Number(rs.getPropertyValue("--text-color").split("(")[1].split(",")[0]) + ", " + Number(rs.getPropertyValue("--text-color").split("(")[1].split(",")[1]) + ", " + Number(rs.getPropertyValue("--text-color").split("(")[1].split(",")[2].split(")")[0])
    let text_normal = "rgb(" + rgb + ")"
    let color_hidden = "rgba(" + rgb + ", 0.15)"

    if(textarea.style.color == ""){
        document.getElementById("textopacity_holder").classList.add("button_active")
        textarea.style.color = color_hidden
        return
    }

    if(textarea.style.color == text_normal){
        document.getElementById("textopacity_holder").classList.add("button_active")
        textarea.style.color = color_hidden
    }else{
        document.getElementById("textopacity_holder").classList.remove("button_active")
        textarea.style.color = text_normal
    }
}





function unload_file(){
    document.getElementById("passage_title").innerHTML = ""
    textarea.value = ""
    textarea.disabled = true
}

// file browser with click menu
function file_contextMenu(file, event){
    contextMenu.style.left = event.clientX + 5   + "px"
    contextMenu.style.top = event.clientY + 0 +  "px"
    contextMenu.style.display = "block"
}


// closing right click menu if clicked on nothing..
document.addEventListener("click", function(){
    if(contextMenu.style.display == "none"){
        return
    }else{

        if(event.target != contextMenu && event.target.parentElement != contextMenu){
            contextMenu.style.display = "none"
            for(let i = 0; i < document.getElementsByClassName("list_selected").length; i++){
                document.getElementsByClassName("list_selected")[i].classList.remove("list_selected")
                file_rightclick = "BLANK"
            }
        }
    }
})







// deleting files == moving to "Trash/"... so as to not accidentally perma-delete something...
const file_delete = async () => {

    await window.ipc.deleteFile(current_dir + file_rightclick)


    let delay = setTimeout(function(){

        load_dir(current_dir, "reload")
        document.getElementById("prompt_container").style.visibility = "hidden"
    
        if(file_rightclick.slice(0, -4) == file_selected){
            unload_file()
        }

        if(file_rightclick.slice(-4) == ".txt"){
            toast_notif("Deleted " + file_rightclick.slice(0, -4) + ".txt")
        }else{
            toast_notif("Deleted " + file_rightclick)
        }

    }, 5)

}


const file_rename = async () => {

    if(file_rightclick.slice(0, -4) == file_selected){
        unload_file()
    }

    if(file_rightclick.slice(-4) != ".txt"){
        await window.ipc.renameFile(current_dir + file_rightclick, current_dir + document.getElementById("prompt_input").value)
    }else{
        await window.ipc.renameFile(current_dir + file_rightclick, current_dir + document.getElementById("prompt_input").value + ".txt")
    }
    load_dir(current_dir, "reload")
    document.getElementById("prompt_container").style.visibility = "hidden"
    toast_notif("Rename complete!")
}



function toast_notif(message){
    // delete previous toast to prevent overlap
    if(document.getElementsByClassName("toast").length != 0){
        document.getElementsByClassName("toast")[0].remove()
    }

    let toast = document.createElement("p")
    toast.classList.add("toast")
    toast.innerHTML = message
    document.body.appendChild(toast)

    let toast_delete = setTimeout(function(){
        toast.remove()
    }, 2000)
}








// ::PROGRAM STARTUP FUNC
const program_init = async () => {

    root_dir = await window.ipc.rootDir()

    root_dir = root_dir.replaceAll("\\", "/")

    await init_cssList()

    let idk = await css_preload()

    load_dir(root)

    let result = await window.ipc.readFile("config.json")
    
    config.loadedTheme = JSON.parse(result).loadedTheme
    
}






const rootdirtest = async () => {
    console.log(await window.ipc.rootDir())
}


let bg_i = 0

const css_preload = async () => {


    if(bg_i >= theme_list.length){

                document.documentElement.style = ""
        
                document.getElementById("theme").href = root_dir + "/themes/" + config.loadedTheme + ".css"
                document.getElementById("css_select").value = config.loadedTheme
                change_css(config.loadedTheme)

            
        return
    }else{

        preload_img(theme_list[bg_i])
    }

}

const preload_img = async (theme) => {

    let result = await window.ipc.readFile(root_dir + "/themes/" + theme)

    if(result.split("background-img:")[1]?.split(";")[0] == undefined){
        bg_i++
        css_preload()

    }else{
        load_background(result.split("background-img:")[1].split(";")[0])

        let bg_load = document.createElement("img")

        bg_load.src = result.split("background-img:")[1].split(";")[0].split('"')[1]

        bg_load.classList.add("bg_loaded")
        document.getElementById("preload_stuff").appendChild(bg_load)

        let timeout = setTimeout(function(){
            bg_i++
            css_preload()
        }, 100)

    }

}


const preload_theme = async (theme) => {

    if(document.getElementById("css_select").value == ""){
        console.log("????")
        return
    }

    document.documentElement.style = ""
    document.getElementById("theme").href = root_dir + "/themes/" + theme



    let content = await window.ipc.readFile(root_dir + "/themes/" + theme)


    if(content.includes("--background-img:") == true){


        let img = content.split("--background-img:")[1].split(";")[0]
        if(img.slice(0, 1) == `"`){
            img = img.split(`"`)[1]
        }

        let bg_load = document.createElement("img")
        bg_load.src = img
        bg_load.classList.add("bg_loaded")
        document.getElementById("preload_stuff").appendChild(bg_load)

    }


    let css_preload = document.createElement("link")
    css_preload.rel = "stylesheet"
    css_preload.type = "text/css"
    css_preload.media = "all"
    css_preload.href = root_dir + "/themes/" + theme
    document.getElementById("preload_stuff").appendChild(css_preload)



}


let theme_Obj = {}
const read_css = async (file) => {

    let result = await window.ipc.readFile(file)


    let theme_name = file.split("/")[file.split("/").length - 1].split(".")[0]

    theme_Obj[theme_name] = {}

    result = result.split("--")

    for(let i = 1; i < result.length; i++){
        if(result[i].split(";")[0].split(":").length > 2){
            theme_Obj[theme_name][result[i].split(";")[0].split(":")[0]] = result[i].split(";")[0].split(":")[1] + ":" + result[i].split(";")[0].split(":")[2]
        }else{
            theme_Obj[theme_name][result[i].split(";")[0].split(":")[0]] = result[i].split(";")[0].split(":")[1]
        }
    }
    return theme_Obj[theme_name]
    // I put all this stuff into an object thinking I might need it but ig it's unused.. idk
}


function prompt(type, filename){
    console.log("PROMPT: " + type)
    console.log("prompt: " + filename)

    if(type.includes("theme") == true){
        filename = document.getElementById("css_select").value
    }

    // cleaning up right click menu & theme menu dropdown stuff
    contextMenu.style.display = "none"
    for(let i = 0; i < document.getElementsByClassName("list_selected").length; i++){
        document.getElementsByClassName("list_selected")[i].classList.remove("list_selected")
    }
    document.getElementById("prompt_container").style.visibility = "visible"
    document.getElementById("theme_dropdown").style.visibility = "hidden"
    document.getElementById("menu_arrow").src = "icon_arrow_down.png"
    document.getElementById("prompt_create_css_dupe").style.display = "none"


    if(document.getElementById("prompt_confirm") != null){
        document.getElementById("prompt_confirm").remove()
    }
    let confirm_button = document.createElement("button")
    confirm_button.id = "prompt_confirm"
    document.getElementById("prompt_buttons").appendChild(confirm_button)


    // Creating File
    if(type.includes("create") == true){

        document.getElementById("prompt_text").innerHTML = `Create <span style="" id="span_type">File</span>" <input type="text" id="prompt_input"> "?`
        confirm_button.innerHTML = "Create"

        if(type == "file_create"){
            document.getElementById("span_type").addEventListener("click", function(){
                if(document.getElementById("span_type").innerHTML == "File"){
                    document.getElementById("span_type").innerHTML = "Folder"
                }else{
                    document.getElementById("span_type").innerHTML = "File"
                }
            })
        }

        if(type == "create_css"){
            document.getElementById("prompt_text").innerHTML = `Create Theme " <input type="text" id="prompt_input"> "?`
            document.getElementById("prompt_create_css_dupe").style.display = "block"
        }


    }


let current_name

    // Renaming
    if(type.includes("rename") == true){
        confirm_button.innerHTML = "Rename"
        document.getElementById("prompt_text").innerHTML = `Rename "` + filename + `"? <br> <input type="text" id="prompt_input">`
        current_name = filename
    }


    // Deleting
    if(type.includes("delete") == true){
        confirm_button.innerHTML = "Delete"
        document.getElementById("prompt_text").innerHTML = `Delete "` + filename + `"?`
    }


    // Loading
    if(type.includes("load") == true){
        confirm_button.innerHTML = "Load"
        document.getElementById("prompt_text").innerHTML = `Load "` + filename + `"?`
        file_selected = filename
    }

    // Saving
    if(type.includes("save") == true){
        confirm_button.innerHTML = "Save"
        document.getElementById("prompt_text").innerHTML = `Save "` + file_selected + `"?`
        textarea.blur()
        file_selected = filename
    }


    confirm_button.addEventListener('click', eval(type))
    document.getElementById("prompt_container").style.visibility = "visible"

    if(document.getElementById("prompt_input") != null){

        document.getElementById("prompt_input").classList.add("input_invalid")
        document.getElementById("prompt_confirm").classList.add("button_disabled")


        if(type.includes("css") == true || type.includes("theme") == true){
            document.getElementById("prompt_input").addEventListener("input", function(){
                input_check(document.getElementById("prompt_input").value, "theme", current_name)
            })
        }

        if(type.includes("file") == true){
            document.getElementById("prompt_input").addEventListener("input", function(){
                input_check(document.getElementById("prompt_input").value, "file", current_name)
            })
        }


    }


}


function input_check(input, type, current_name){
    let filetype
    if(type == "file"){
        type = dir_array
        filetype = ".txt"
    }
    if(type == "theme"){
        type = theme_list
        filetype = ".css"
    }

    let flag = false

    for(let i = 0; i < type.length; i++){


        if(input.length == 0 || input.includes("/") || input.includes("\\") || input.includes(":") || input.includes("*") || input.includes("?") || input.includes(`"`) || input.includes("<") || input.includes(">") || input.includes("|")){
            console.log("INVALID CHARACTER DETECTED")
            document.getElementById("prompt_input").classList.add("input_invalid")
            document.getElementById("prompt_confirm").classList.add("button_disabled")
            flag = true
            continue

        }

        if((input + filetype).toUpperCase() == type[i].toUpperCase() || input.toUpperCase() == type[i].toUpperCase()){

            if(current_name != undefined && (input + filetype).toUpperCase() == current_name.toUpperCase() || current_name != undefined && input.toUpperCase() == current_name.toUpperCase()){
                console.log("filename identical to itself...")
            }else{
            console.log("IDENTICAL FILENAME DETECTED")
            document.getElementById("prompt_input").classList.add("input_invalid")
            document.getElementById("prompt_confirm").classList.add("button_disabled")
            flag = true
            continue
            }
        }

    }
    // if no errors were raised
    if(flag == false){
        document.getElementById("prompt_input").classList.remove("input_invalid")
        document.getElementById("prompt_confirm").classList.remove("button_disabled")
        console.log("input_invalid removed")
    }

    return flag
    
}