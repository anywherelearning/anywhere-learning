// Rebuilds public/og-default.jpg from the LIVE homepage hero: loads it in
// headless Chrome at 1200x630, runs og-dom.js to hide the nav, buttons and demo
// card, then captures. Usage: node scripts/og-card/capture.mjs /tmp/og.png
// then: sips -s format jpeg -s formatOptions 88 /tmp/og.png --out public/og-default.jpg
// and bump ?v=N wherever og-default.jpg is referenced.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
const OUT = process.argv[2];
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless=new','--remote-debugging-port=9333','--hide-scrollbars','--user-data-dir=/tmp/claude-501/og-chrome','about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i=0;i<40;i++){ try{ const l=await (await fetch('http://127.0.0.1:9333/json')).json(); target=l.find(t=>t.type==='page'); if(target) break;}catch{} await sleep(250); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id=0; const pending={};
ws.onmessage = e => { const m=JSON.parse(e.data); if(m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; } };
const send = (method, params={}) => new Promise(r => { const i=++id; pending[i]=r; ws.send(JSON.stringify({id:i, method, params})); });
await send('Emulation.setDeviceMetricsOverride',{width:1200,height:630,deviceScaleFactor:1,mobile:false});
await send('Page.enable');
await send('Page.navigate',{url:'https://anywherelearning.co/?og=' + Date.now()});
await sleep(6000);
const js = fs.readFileSync(new URL('./og-dom.js', import.meta.url), 'utf8');
const res = await send('Runtime.evaluate',{expression: js, awaitPromise:true, returnByValue:true});
console.log(JSON.stringify(res.result?.result?.value ?? res));
await sleep(1500);
const shot = await send('Page.captureScreenshot',{format:'png', clip:{x:0,y:0,width:1200,height:630,scale:1}});
fs.writeFileSync(OUT, Buffer.from(shot.result.data,'base64'));
ws.close(); chrome.kill(); process.exit(0);
