
const fs=require('fs'),path=require('path'),http=require('http'),{spawn}=require('child_process'),assert=require('assert');
const delay=ms=>new Promise(r=>setTimeout(r,ms));const out=path.resolve('.tmp/visual-review');
const server=http.createServer((req,res)=>{const name=req.url.split('?')[0];const file=name==='/images/colegio-principe-de-asturias.png'?path.resolve('public/images/colegio-principe-de-asturias.png'):path.join(out,name==='/'?'challenge.html':path.basename(name));res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.png')?'image/png':'text/html');try{res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}});
(async()=>{await new Promise(r=>server.listen(9401,'127.0.0.1',r));
const browser=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=9340','--user-data-dir='+path.join(out,'challenge-chrome'),'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws;try{
let targets;for(let i=0;i<40;i++){try{targets=await(await fetch('http://127.0.0.1:9340/json')).json();break;}catch{await delay(250);}}
ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const callbacks=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&callbacks.has(m.id)){const [r,j]=callbacks.get(m.id);callbacks.delete(m.id);m.error?j(Error(m.error.message)):r(m.result);}};
const send=(method,params={})=>new Promise((r,j)=>{const key=++id;callbacks.set(key,[r,j]);ws.send(JSON.stringify({id:key,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const check=async(label,expr)=>{assert(await evaluate(expr),label);console.log('PASS '+label);};
const click=async text=>{await evaluate('(()=>{const b=[...document.querySelectorAll("button")].find(e=>e.textContent.includes('+JSON.stringify(text)+'));if(!b)throw Error("missing button");b.click();})()');await delay(70);};
const snap=async name=>{const png=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(png.data,'base64'));};
await send('Page.enable');
for(const width of [390,1440]){
await send('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:9401/'});
await delay(1300);
await click('Obtener desafío');await delay(500);
await check('4 options at '+width,'document.querySelectorAll(".challenge-option").length===4');
await check('no overflow at '+width,'document.documentElement.scrollWidth<=innerWidth');
await evaluate('document.querySelector(".challenge-arena").scrollIntoView({block:"start"})');await delay(100);await snap('challenge-options-'+width);
await click('La planta junto');await click('Confirmar respuesta');
await check('locked during grading','document.querySelector(".challenge-option").disabled');
await delay(450);
await check('correct answer celebration','document.body.innerText.includes("¡Misión superada!")&&document.querySelectorAll(".confetti-piece").length===54');
await check('XP awarded','document.body.innerText.includes("+35 XP ganados")');
await delay(900);await snap('challenge-win-'+width);
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await check('reduced motion hides confetti','getComputedStyle(document.querySelector(".school-confetti")).display==="none"');
await send('Emulation.setEmulatedMedia',{features:[]});
await click('Siguiente desafío');await delay(500);
await check('new round resets selection','!document.querySelector(".school-confetti")&&!document.querySelector(".challenge-option[aria-pressed=true]")');
await click('La planta de la caja');await click('Confirmar respuesta');await delay(450);
await check('wrong answer never celebrates','!document.querySelector(".school-confetti")&&document.body.innerText.includes("20 / 100")');
await click('Siguiente desafío');await delay(500);await click('La planta junto');
await evaluate('window.failEvaluation=true');await click('Confirmar respuesta');await delay(450);
await check('failure preserves answer for retry','!!document.querySelector(".challenge-option[aria-pressed=true]")&&!document.querySelector(".school-confetti")');
await evaluate('window.failEvaluation=false');
await click('Explícalo');await click('Obtener desafío');await delay(500);
await check('creative challenges keep free text','!!document.querySelector("textarea")&&!document.querySelector(".challenge-option")');
}
}finally{if(ws)ws.close();browser.kill();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
