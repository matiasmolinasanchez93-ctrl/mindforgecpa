const fs=require('fs'),path=require('path'),{spawn}=require('child_process'),{pathToFileURL}=require('url');
const out=path.resolve('.tmp/visual-review');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
const browser=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9338','--remote-debugging-address=127.0.0.1','--user-data-dir='+path.join(out,'chrome-profile'),'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws;
try {
 let targets;for(let i=0;i<60;i++){try{targets=await(await fetch('http://127.0.0.1:9338/json')).json();break;}catch{await delay(250);}}
 if(!targets)throw Error('Browser did not start');
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let id=0;const callbacks=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&callbacks.has(m.id)){const [r,j]=callbacks.get(m.id);callbacks.delete(m.id);m.error?j(Error(m.error.message)):r(m.result);}};
 const send=(method,params={})=>new Promise((r,j)=>{const key=++id;callbacks.set(key,[r,j]);ws.send(JSON.stringify({id:key,method,params}));});
 await send('Page.enable');await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 const names=JSON.parse(fs.readFileSync(path.join(out,'cases.json'),'utf8')), report=[];
 for(const width of [1440,390,320]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
 for(const name of names){
 await send('Page.navigate',{url:pathToFileURL(path.join(out,name+'.html')).href});
 await delay(80);
 await send('Runtime.evaluate',{expression:'document.fonts.ready',awaitPromise:true});
 const result=await send('Runtime.evaluate',{expression:'JSON.stringify({width:innerWidth,scroll:document.documentElement.scrollWidth,headings:[...document.querySelectorAll("h1")].map(e=>e.textContent),active:[...document.querySelectorAll("aside nav [aria-current=page]")].map(e=>e.textContent),overflow:[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(e).position!=="fixed").slice(0,8).map(e=>({tag:e.tagName,cls:e.className}))})',returnByValue:true});
 const details=JSON.parse(result.result.value);report.push({name,width,...details});
 if(width!==320){const png=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'-'+width+'.png'),Buffer.from(png.data,'base64'));}
 }
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
 const overflows=report.filter(r=>r.scroll>r.width);
 console.log(JSON.stringify({screens:report.length,overflows},null,2));
 for(const width of [1440,390]){
 const html='<html><style>body{margin:0;background:#e5e8ee;font:14px Arial}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:12px}img{width:100%;display:block}p{margin:4px}</style><div class="grid">'+names.map(n=>'<div><p>'+n+'</p><img src="'+n+'-'+width+'.png"></div>').join('')+'</div></html>';
 fs.writeFileSync(path.join(out,'contact-'+width+'.html'),html);
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:width===1440?1450:4700,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:pathToFileURL(path.join(out,'contact-'+width+'.html')).href});await delay(300);
 const png=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,'contact-'+width+'.png'),Buffer.from(png.data,'base64'));
 }
 await send('Browser.close');ws.close();
}finally{if(ws)ws.close();browser.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
