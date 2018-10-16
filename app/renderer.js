// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer} = require('electron');

let holder = document.getElementById('drop');

holder.ondragover = () => {
    holder.className="hot";
    return false;
};

holder.ondragleave = () => {
    holder.className="";
    return false;
};

holder.ondragend = () => {
    return false;
};

holder.ondrop = (e) => {
    e.preventDefault();

    holder.value = e.dataTransfer.getData("text/uri-list");
    
    return false;
};

let fetch = document.getElementById('fetch');
fetch.onclick = (e) => {
    e.preventDefault();

    let supported = ["extract-audio", "audio-format", "recode-video"];
    let opts = {};

    supported.forEach((o) => {
	let el = document.getElementById(o);
	opts[o] = el.type === 'checkbox' ? el.checked : el.value;
    });

    if(opts['extract-audio']) {
	delete opts['recode-video']; // don't want mp3 in an mp4 container
    }

    log("stdout", "starting");
    ipcRenderer.send("fetch", holder.value, opts);

    document.querySelectorAll('input,button,select').forEach((o) => { o.disabled=true; });
    
    return false;
};

const log = (stream, content) => {
    console.log(stream, content);
    let p = document.createElement('p');
    p.innerHTML = content.trim();
    p.className = stream;
    document.getElementById('console').appendChild(p);
    let ps = document.querySelectorAll('#console p');
    if(ps.length > 15) {
	ps[0].remove();
    }
//    window.scrollTo(0,document.querySelector("#console").scrollHeight);
};

ipcRenderer.on("stdout", (e, ...args) => { log("stdout", ...args); });
ipcRenderer.on("stderr", (e, ...args) => { log("stderr", ...args); });

ipcRenderer.on("exit", (e, ...args) => {
    log("stdout", "all done");
    document.querySelectorAll('input,button,select').forEach((o) => { o.disabled=false; });
});
