/**
 * Isolated Chrome UI test for vocabulary overflow tabs.
 * npm run test:tab-overflow
 * Uses a mocked API; never touches a real account or database.
 */
import { spawn, execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root=resolve(dirname(fileURLToPath(import.meta.url)), '..')
const chromePath=['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(existsSync)
if(!chromePath || !globalThis.WebSocket) throw new Error('Chrome/Edge and Node 22+ required')
const widths=[240,320,1280], themes=['light','dark'], base='http://127.0.0.1:5201'
const api='http://127.0.0.1:3055', port=9359
const temp=mkdtempSync(resolve(tmpdir(),'vocab-tabs-'))
const output=resolve(root,'tests','tab-overflow-audit-report.json')
const imageFolder=resolve(root,'tests','responsive-screenshots')
const children=[], pending=new Map(), failures=[], samples=[], promotions=[]
let ws, next=0, activeTab='tab2', order=[]

function reset() { activeTab='tab2'; order=Array.from({length:6},(_,i)=>({id:'tab'+(i+1),name:'Tab '+(i+1),icon:'book',sortOrder:i+1,vocabularies:[]}));promotions.length=0 }
function apiPayload(request) {
  const url=new URL(request.url), path=url.pathname, method=request.method
  if(path==='/auth/me') return {id:'test-owner',fullName:'Tab Audit',email:'audit@example.invalid',
    totalWords:0,theme:'light',vocabularyLayout:'list'}
  if(path==='/auth/recalculate-words')return {totalWords:0}
  if(path==='/vocabulary-tabs' && method==='GET') return order
  if(path==='/vocabulary/settings')return {activeTabId:activeTab,isAllTabHidden:false,isFilterExpanded:false}
  if(path==='/vocabulary/settings/active-tab' && method==='PATCH') {
    const body=JSON.parse(request.postData||'{}')
    activeTab=body.tabId
    if (body.fromOverflow) {
      promotions.push(body)
      const tab=order.find(t=>t.id===body.tabId)
      const previous=order.find(t=>t.id===body.previousTabId)
      order=[tab,...(previous&&previous!==tab?[previous]:[]),
        ...order.filter(t=>t!==tab&&t!==previous)].filter(Boolean)
    }
    return {success:true}
  }
  if(path==='/vocabulary' || path==='/vocabulary/favorites/list')
    return {data:[],items:[],vocabularies:[],total:0,page:1,limit:20,totalPages:1}
  return method==='OPTIONS'?{}:[]
}
const pause=ms=>new Promise(r=>setTimeout(r,ms))
async function ready(url) {
  for(let i=0;i<75;i++){try{if((await fetch(url)).ok)return}catch{}await pause(200)}
  throw new Error('Not ready '+url)
}
const send=(method,params={},timeout=10000)=>new Promise((res,rej)=>{
  const id=++next,t=setTimeout(()=>{pending.delete(id);rej(new Error('CDP timeout '+method))},timeout)
  pending.set(id,{resolve:x=>{clearTimeout(t);res(x)},reject:e=>{clearTimeout(t);rej(e)}})
  ws.send(JSON.stringify({id,method,params}))
})
async function evalJs(expression) {
  const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})
  if(r.exceptionDetails)throw new Error(r.exceptionDetails.text)
  return r.result?.value
}
async function waitForTabBar() {
  for(let i=0;i<30;i++){
    if(await evalJs("document.querySelectorAll('.vocab-tabs-wrapper .group.relative button').length >= 2"))return
    await pause(200)
  }
  const debug=await evalJs("({href:location.href,title:document.title,body:document.body.innerText.slice(0,700),count:document.querySelectorAll('.vocab-tabs-wrapper').length,token:localStorage.getItem('token')})")
  throw new Error('Vocabulary tab bar did not render: '+JSON.stringify(debug))
}
const moreButton=".vocab-tabs-wrapper button.more-tabs-btn"
const visibleTabNames=`[...document.querySelectorAll('.vocab-tabs-wrapper > div > div.group.relative > button:first-child')]
  .map(b=>b.textContent.trim()).filter(x=>x.startsWith('Tab '))`
try{
  children.push(spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5201','--strictPort'],
    {cwd:root,env:{...process.env,VITE_API_URL:api},windowsHide:true,stdio:'ignore'}))
  await ready(base)
  children.push(spawn(chromePath,['--headless=new','--disable-gpu','--no-first-run','--disable-extensions',
    '--disable-background-networking','--remote-allow-origins=*','--remote-debugging-port='+port,
    '--user-data-dir='+resolve(temp,'profile'),'--window-size=1280,800',base],
    {windowsHide:true,stdio:'ignore'}))
  await ready('http://127.0.0.1:'+port+'/json/version')
  const tabs=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json()
  ws=new WebSocket(tabs.find(x=>x.type==='page').webSocketDebuggerUrl)
  await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej})
  ws.onmessage=({data})=>{
    const m=JSON.parse(data)
    if(m.id && pending.has(m.id)){
      const p=pending.get(m.id);pending.delete(m.id)
      m.error?p.reject(new Error(m.error.message)):p.resolve(m.result)
    }else if(m.method==='Fetch.requestPaused'){
      const id=m.params.requestId,request=m.params.request
      const headers=[{name:'Content-Type',value:'application/json'},
        {name:'Access-Control-Allow-Origin',value:base},
        {name:'Access-Control-Allow-Methods',value:'GET,POST,PUT,PATCH,DELETE,OPTIONS'},
        {name:'Access-Control-Allow-Headers',value:'Content-Type,Authorization'}]
      let payload
      try{payload=apiPayload(request)}catch(e){failures.push('API mock: '+e.message);payload=[]}
      send('Fetch.fulfillRequest',{requestId:id,responseCode:200,responseHeaders:headers,
        body:Buffer.from(JSON.stringify(payload)).toString('base64')}).catch(e=>failures.push(e.message))
    }
  }
  await send('Runtime.enable')
  await send('Page.enable')
  await send('Fetch.enable',{patterns:[{urlPattern:api+'/*',requestStage:'Request'}]})
  await send('Page.navigate',{url:base+'/'})
  await pause(550)
  await send('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.removeItem('vocabmaster.backend-url')}catch(e){}"})
  for(const theme of themes) for(const width of widths) {
    reset()
    const label=theme+' / '+width+'px'
    await send('Emulation.setDeviceMetricsOverride',{width,height:760,deviceScaleFactor:1,mobile:true,screenWidth:width,screenHeight:760})
    await evalJs(`localStorage.setItem('theme',${JSON.stringify(theme)});
      localStorage.setItem('locale','en');localStorage.setItem('token','audit-only')`)
    await send('Page.navigate',{url:base+'/vocabulary'})
    await waitForTabBar()
    await pause(450)
    const before=await evalJs(visibleTabNames)
    // Click an ordinary visible tab; there must be no promotion request.
    const normal=await evalJs("(()=>{let b=[...document.querySelectorAll('.vocab-tabs-wrapper button')].find(x=>x.textContent.trim()==='Tab 1');if(!b)return false;b.click();return true})()")
    await pause(260)
    const noReorder=promotions.length===0
    // The menu must keep edit/delete controls visible and inside the screen.
    const opened=await evalJs(`(()=>{const b=document.querySelector('${moreButton}');if(!b)return false;b.click();return true})()`)
    await pause(240)
    const menu=await evalJs(`(()=>{
      const panel=document.querySelector('.more-tabs-dropdown')
      if(!panel)return null
      const box=panel.getBoundingClientRect()
      const item=[...panel.querySelectorAll('.dropdown-body > div')].find(el=>el.textContent.includes('Tab 6'))
      const del=item?.querySelector('button[aria-label="Delete Tab"]')
      const edit=item?.querySelector('button[aria-label="Edit Name"]')
      const buttons=[del,edit].map(b=>{if(!b)return null;const r=b.getBoundingClientRect()
        return {visible:getComputedStyle(b).opacity!=='0',size:[r.width,r.height],
          fits:r.left>=-2&&r.right<=innerWidth+2}})
      return {panelFits:box.left>=-2&&box.right<=innerWidth+2,
        bodyOverflow:document.documentElement.scrollWidth>innerWidth+2,
        buttons,shown:!!item}
    })()`)
    if(width<=320&&menu) {
      mkdirSync(imageFolder,{recursive:true})
      const snap=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})
      writeFileSync(resolve(imageFolder,'tab-overflow-'+width+'-'+theme+'.png'),
        Buffer.from(snap.data,'base64'))
    }
    const clicked=await evalJs("(()=>{const item=[...document.querySelectorAll('.more-tabs-dropdown .dropdown-body>div')].find(x=>x.textContent.includes('Tab 6'));const b=item?.querySelector('button:first-child');if(!b)return false;b.click();return true})()")
    await pause(500)
    const after=await evalJs(visibleTabNames)
    const correctPromotion=promotions.length===1&&promotions[0].tabId==='tab6'&&promotions[0].previousTabId==='tab1'
    await send('Page.navigate',{url:base+'/vocabulary'})
    await waitForTabBar()
    await pause(400)
    const afterReload=await evalJs(visibleTabNames)
    await evalJs(`document.querySelector('${moreButton}')?.click()`)
    await pause(220)
    const deleteClicked=await evalJs("(()=>{const row=[...document.querySelectorAll('.more-tabs-dropdown .dropdown-body>div')].find(x=>x.textContent.includes('Tab 5'));const button=row?.querySelector('button[aria-label=\"Delete Tab\"]');if(!button)return false;button.click();return true})()")
    await pause(250)
    const deleteConfirmation=await evalJs("document.body.innerText.includes('Delete tab \"Tab 5\"?')")
    const expected=['Tab 6','Tab 1']
    const passed=opened&&normal&&noReorder&&clicked&&correctPromotion&&deleteClicked&&deleteConfirmation&&
      menu?.panelFits&&!menu?.bodyOverflow&&menu?.shown&&
      menu.buttons.every(b=>b&&b.visible&&b.fits&&b.size[0]>=30&&b.size[1]>=30)&&
      JSON.stringify(after.slice(0,2))===JSON.stringify(expected)&&
      JSON.stringify(afterReload.slice(0,2))===JSON.stringify(expected)
    samples.push({theme,width,passed,before,after,afterReload,menu,promotions:[...promotions]})
    if(!passed)failures.push(label+' '+JSON.stringify(samples.at(-1)))
    console.log((passed?'PASS ':'FAIL ')+label)
  }
  writeFileSync(output,JSON.stringify({samples,failures},null,2))
  console.log('TAB OVERFLOW UI AUDIT: '+samples.length+' samples, '+failures.length+' failures')
  console.log('REPORT '+output)
  if(failures.length)process.exitCode=1
}finally{
  try{ws?.close()}catch{}
  for(const child of children.reverse()) if(child?.pid){
    try{execFileSync('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true})}
    catch{try{child.kill()}catch{}}
  }
  try{rmSync(temp,{recursive:true,force:true})}catch{}
}
