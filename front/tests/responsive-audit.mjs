/**
 * Frontend responsive smoke audit with an isolated Chromium profile and stub API.
 * Run: node tests/responsive-audit.mjs [--widths=280,320,375,768,1280] [--height=820] [--theme=light|dark|both] [--locale=vi|en|ko|zh-CN] [--long-content]
 * Does not connect to the real backend, use actual accounts, or change app data.
 */
import { spawn, execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const browserPath = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(existsSync)
if (!browserPath) throw new Error('Chrome or Edge required for responsive audit')
if (!globalThis.WebSocket) throw new Error('Node 22+ with built-in WebSocket is required')
const widthFlag = process.argv.find((a) => a.startsWith('--widths='))
const themeFlag = process.argv.find((a) => a.startsWith('--theme='))?.slice(8) || 'both'
const widths = (widthFlag ? widthFlag.slice(9) : '280,320,360,390,430,768,1280').split(',').map(Number)
const height = Math.max(240, Number(process.argv.find((a)=>a.startsWith('--height='))?.slice(9) || 820))
const locale = process.argv.find((a)=>a.startsWith('--locale='))?.slice(9) || 'vi'
const longContent = process.argv.includes('--long-content')
const themes = themeFlag === 'both' ? ['light', 'dark'] : [themeFlag]
const base = 'http://127.0.0.1:5199'
const api = 'http://127.0.0.1:3055'
const output = resolve(root, 'tests', 'responsive-audit-report.json')
const screenshotFolder = resolve(root, 'tests', 'responsive-screenshots')
const screenshots = new Set(['/', '/login', '/register', '/vocabulary', '/practice', '/srs', '/voice-settings', '/about', '/learning-progress', '/history', '/profile', '/favorites', '/categories', '/tags'])
const scenarioResults = []
const routes = ['/', '/about', '/login', '/register', '/vocabulary', '/vocabulary/by-date',
  '/favorites', '/history', '/profile', '/voice-settings', '/categories', '/categories/audit-category',
  '/tags', '/tags/audit-tag', '/practice', '/srs', '/learning-progress']
const guestRoutes = new Set(['/login', '/register'])
const tempDir = mkdtempSync(resolve(tmpdir(), 'vocab-responsive-'))
const children = []
let socket
let requestId = 0
const pending = new Map()
const errors = []
const consoleWarnings = []
let currentRoute = ''
let activeTheme = 'light'

const user = { id: 'audit-user', fullName: 'Mobile Audit', email: 'audit@example.invalid',
  totalWords: 12, totalScore: 100, theme: 'light', vocabularyLayout: 'list',
  categoriesLayout: 'grid', avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E' }
if (longContent) user.fullName = 'Người dùng trải nghiệm ứng dụng trên thiết bị có màn hình rất nhỏ với họ tên cực kỳ dài'
const words = [
  {id: 'word1', word: 'architecture', meaning: 'kiến trúc', translation: 'kiến trúc',
   pronunciation: '/ˈɑːkɪtektʃə/', definition: 'The art of designing buildings',
   example: 'A carefully designed home', image: null, images: [], tags: [], categories: [],
   difficulty: 'medium', favorite: false, isFavorite: false, createdAt:'2026-11-21T09:00:00Z' },
  {id: 'word2', word: 'responsiveness', meaning: 'khả năng thích ứng',
   translation: 'khả năng thích ứng', image:null, images:[], tags:[], categories:[],
   difficulty:'easy', createdAt:'2026-11-21T09:00:00Z'}
]
if (longContent) {
  words[0].word = 'extraordinarily-long-vocabulary-without-spaces-testing-wrapping'
  words[0].meaning = 'This is a very long meaning to verify the vocabulary layout adapts to narrow screens without clipping useful text'
  words[1].word = 'antidisestablishmentarianism-super-long-word'
}
function mockPayload(url, method) {
  const path = new URL(url).pathname
  if (path === '/auth/me') return user
  if (path === '/auth/recalculate-words') return {totalWords:12}
  if (path === '/auth/theme') return {success:true}
  if (path === '/vocabulary-tabs') return [{id:'tab1', name:'English', icon:'book', vocabularies:words}]
  if (path === '/vocabulary/settings') return {isFilterExpanded: false, isAllTabHidden:false, activeTabId:null}
  if (path === '/vocabulary' || path === '/vocabulary/favorites/list') return {data:words, items:words, vocabularies:words, total:2, page:1, limit:20, totalPages:1}
  if (path === '/vocabulary/by-learning-date') return []
  if (path.startsWith('/category')) return path === '/category' ? [] : {id:'audit-category',name:'Demo',vocabularies:[]}
  if (path.startsWith('/tag')) return path === '/tag' ? [] : {id:'audit-tag',name:'Demo',vocabularies:[]}
  if (path === '/history/statistics') return {totalActivities:0,vocabulary:{total:0,created:0,updated:0,deleted:0},practice:{totalPractices:0,accuracy:0,totalScore:0}}
  if (path.startsWith('/history')) return {data:[],items:[],total:0,page:1,totalPages:0}
  if (path.includes('/srs/') || path.startsWith('/srs')) return {totalWords:12,availableWords:4,dueWords:2,newWords:2,reviewed24h:0,reviews:[],items:[],data:[],total:0,meta:{page:1,limit:5,total:0,pageCount:0}}
  if (path === '/learning-progress') return {totalWords:12,masteredWords:4,learningWords:6,newWords:2,masteryPercentage:33.3,totalScore:170,averageScore:85,rank:'beginner',rankProgress:0.3,practiceStats:{totalPractices:6,flashcardCount:2,multipleChoiceCount:1,typingCount:1,listeningCount:1,snakeCount:1,correctAnswers:25,wrongAnswers:5,accuracy:83.3,totalTimeSpent:100},streak:{currentStreak:2,longestStreak:3,lastPracticeDate:'2026-11-21',isActiveToday:false},weeklyProgress:[],achievements:[]}
  if (path === '/voice') return []
  if (path.startsWith('/backgrounds')) return []
  return method === 'OPTIONS' ? {} : []
}
async function waitFor(url, timeout=15000) {
  const started = Date.now()
  while (Date.now()-started<timeout) {
    try { if ((await fetch(url)).ok) return }
    catch {}
    await new Promise(r=>setTimeout(r,250))
  }
  throw new Error('Server did not become ready: '+url)
}
function send(method, params = {}, timeout=10000) {
  return new Promise((resolve, reject) => {
    const id = ++requestId
    const timer = setTimeout(()=> {pending.delete(id); reject(new Error('CDP timeout: '+method))}, timeout)
    pending.set(id, {resolve(value){clearTimeout(timer);resolve(value)},reject(error){clearTimeout(timer);reject(error)}})
    socket.send(JSON.stringify({id,method,params}))
  })
}
function pause(ms) { return new Promise((r)=>setTimeout(r,ms)) }
async function evaluate(expression, timeout=10000) {
  const result = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true},timeout)
  if (result.exceptionDetails) return {exception:result.exceptionDetails.text}
  return result.result?.value
}
const measurement = `(() => {
 const viewport = window.innerWidth, elements = [...document.body.querySelectorAll('*')]
 const visible = (e) => {const s=getComputedStyle(e); return s.display!=='none' && s.visibility!=='hidden'}
 const intentional = (e) => {
   let p=e.parentElement
   for(let i=0;i<5 && p;i++,p=p.parentElement) {
     const s=getComputedStyle(p)
     if(/auto|scroll/.test(s.overflowX) && p.scrollWidth>p.clientWidth+2) return true
   }
   const s=getComputedStyle(e)
   if(s.position==='absolute'||s.position==='fixed') {
     if(s.pointerEvents==='none'||e.closest('[aria-hidden="true"]')) return true
     let ancestor=e.parentElement
     while(ancestor&&ancestor!==document.body) {
       if(/hidden|clip/.test(getComputedStyle(ancestor).overflowX)) return true
       ancestor=ancestor.parentElement
     }
   }
   return false
 }
 const path = e => {
  const a=[]; let walk = e; for(let i=0;i<3&&walk&&walk!==document.body;i++,walk=walk.parentElement) {
   a.unshift(walk.tagName.toLowerCase()+(walk.id?'#'+walk.id:'')+
    (typeof walk.className==='string'?'.'+walk.className.trim().split(/\\s+/).slice(0,2).join('.'):''))
  } return a.join(' > ')
 }
 const overflowing=elements.filter(e=>{
  if(!visible(e)||intentional(e)) return false
  const r=e.getBoundingClientRect()
  return r.width>4 && (r.right>viewport+3||r.left < -3) && r.bottom>0
 }).map(e=>({node:path(e),text:(e.innerText||'').trim().slice(0,55),right:Math.round(e.getBoundingClientRect().right)})).slice(0,14)
 const tiny=elements.filter(e=>/^(BUTTON|INPUT|SELECT)$/.test(e.tagName)||e.tagName==='A')
 .filter(e=>{const r=e.getBoundingClientRect();return visible(e)&&r.width>0&&r.height>0 &&(r.width<32||r.height<30)})
 .map(e=>({node:path(e),size:Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)})).slice(0,10)
 return {title:document.title,headings:[...document.querySelectorAll('h1,h2')].slice(0,4).map(e=>e.textContent.trim().slice(0,65)),
  viewport, layoutViewport:window.innerWidth, scrollWidth:document.documentElement.scrollWidth, bodyScrollWidth:document.body.scrollWidth,
  visibleCount:elements.filter(visible).length,overflowing,tiny}
})()`
try {
  const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5199', '--strictPort'],
    {cwd:root,env:{...process.env,VITE_API_URL:api},windowsHide:true,stdio:'ignore'})
  children.push(vite)
  await waitFor(base)
  const chrome = spawn(browserPath, ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',
    '--disable-background-networking','--disable-extensions','--remote-allow-origins=*',
    '--remote-debugging-port=9348','--user-data-dir='+resolve(tempDir,'browser'),'--window-size=1280,800',
    base+'/'], {windowsHide:true,stdio:'ignore'})
  children.push(chrome)
  await waitFor('http://127.0.0.1:9348/json/version')
  const tabs=await (await fetch('http://127.0.0.1:9348/json/list')).json()
  const target=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl)
  if (!target) throw new Error('No Chrome page target')
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject})
  socket.onmessage=async ({data})=>{
    let msg
    try { msg=JSON.parse(data) } catch {return}
    if (msg.id && pending.has(msg.id)) {
      const p=pending.get(msg.id);pending.delete(msg.id)
      if(msg.error) p.reject(new Error(msg.error.message));else p.resolve(msg.result)
    } else if (msg.method==='Runtime.exceptionThrown') {
      errors.push({route:currentRoute,theme:activeTheme,error:msg.params?.exceptionDetails?.text,details:msg.params?.exceptionDetails?.exception?.description?.slice(0,900),source:msg.params?.exceptionDetails?.url})
    } else if (msg.method==='Runtime.consoleAPICalled' && ['warning','error'].includes(msg.params?.type)) {
      consoleWarnings.push({route:currentRoute,theme:activeTheme,type:msg.params.type,message:msg.params.args?.map(a=>a.value??a.description??'').join(' ').slice(0,500)})
    } else if (msg.method==='Fetch.requestPaused') {
      const {requestId:id,request}=msg.params
      const headers=[{name:'Content-Type',value:'application/json; charset=utf-8'},
        {name:'Access-Control-Allow-Origin',value:base},{name:'Access-Control-Allow-Methods',value:'GET,POST,PUT,PATCH,DELETE,OPTIONS'},
        {name:'Access-Control-Allow-Headers',value:'Content-Type,Authorization'},{name:'Access-Control-Allow-Credentials',value:'true'}]
      const content=JSON.stringify(mockPayload(request.url,request.method))
      send('Fetch.fulfillRequest',{requestId:id,responseCode:200,responseHeaders:headers,
        body:Buffer.from(content).toString('base64')}).catch(()=>{})
    }
  }
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  await send('Fetch.enable',{patterns:[{urlPattern:api+'/*',requestStage:'Request'}]})
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`
    try {localStorage.removeItem('vocabmaster.backend-url')}catch(e){}
  `})
  await evaluate("localStorage.setItem('token','mobile-audit-only');localStorage.setItem('theme','light')")
  const results=[]
  for (const theme of themes) {
    activeTheme=theme; user.theme=theme
    for (const width of widths) {
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true,screenWidth:width,screenHeight:height})
      for (const route of routes) {
        currentRoute=route
        await evaluate(`localStorage.setItem('theme',${JSON.stringify(theme)});localStorage.setItem('locale',${JSON.stringify(locale)});localStorage.${guestRoutes.has(route)?'removeItem':'setItem'}('token'${guestRoutes.has(route)?'':",'mobile-audit-only'"});`)
        await send('Page.navigate',{url:base+route})
        await pause(900)
        let m
        for (let attempt = 0; attempt < 12; attempt++) {
          m = await evaluate(measurement.replace('const viewport = window.innerWidth', 'const viewport = '+width))
          if (m?.viewport && m.visibleCount > 6) break
          await pause(250)
        }
        if (!m?.viewport) console.log('NOT_RENDERED '+theme+' '+width+' '+route+' '+JSON.stringify(m))
        const entry={route,width,theme,...m}
        results.push(entry)
        if (width <= 390 && screenshots.has(route)) {
          mkdirSync(screenshotFolder,{recursive:true})
          const name = (route==='/'?'home':route.slice(1).replaceAll('/','-'))+'-'+width+'-'+theme+'.png'
          const snap = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})
          writeFileSync(resolve(screenshotFolder,name),Buffer.from(snap.data,'base64'))
        }
        if((m?.scrollWidth||0)>width+2 || (m?.overflowing?.length||0)>0)
          console.log('OVERFLOW '+theme+' '+width+' '+route+' scroll='+m.scrollWidth+' off='+m.overflowing.map(x=>x.node).slice(0,3).join('|'))
        if (width <= 390 && (route === '/vocabulary' || route === '/srs')) {
          const selector = route === '/vocabulary' ? 'button.add-button' : '[id^="srs-size-trigger-"]'
          const activated = await evaluate(`(() => {const button=document.querySelector(${JSON.stringify(selector)});if(!button)return false;button.click();return true})()`)
          await pause(500)
          const detail = await evaluate(measurement.replace('const viewport = window.innerWidth', 'const viewport = '+width))
          const visiblePanel = await evaluate(`Boolean(document.querySelector(${JSON.stringify(route === '/vocabulary' ? 'div.fixed.inset-0.z-50' : '[role="listbox"]')}))`)
          const check = {theme,width,route,scenario:route==='/vocabulary'?'create-modal':'session-size-dropdown',activated,visiblePanel,...detail}
          scenarioResults.push(check)
          if (width <= 320) {
            const snap = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})
            writeFileSync(resolve(screenshotFolder, (route==='/vocabulary'?'vocabulary-create-modal':'srs-session-dropdown')+'-'+width+'-'+theme+'.png'),Buffer.from(snap.data,'base64'))
          }
        }
        if (width <= 390 && route === '/vocabulary') {
          // Revisit the page to close the creation modal before testing selection flows.
          await send('Page.navigate',{url:base+route})
          await pause(950)
          const selected = await evaluate("(() => { const toggle=document.querySelector('button[title=\"Select\"]'); if(!toggle)return false; toggle.click();return true; })()")
          await pause(250)
          const barVisible = await evaluate("Boolean([...document.querySelectorAll('div.fixed')].find(el=>String(el.className).includes('left-1/2')))")
          const bulkActivated = await evaluate("(() => {const bar=[...document.querySelectorAll('div.fixed')].find(el=>String(el.className).includes('left-1/2'));const action=bar?.querySelector('button');if(!action)return false;action.click();return true})()")
          await pause(450)
          const bulkModal = await evaluate("Boolean(document.querySelector('[role=\"dialog\"][aria-modal=\"true\"]'))")
          const bulkDetail = await evaluate(measurement.replace('const viewport = window.innerWidth', 'const viewport = '+width))
          scenarioResults.push({theme,width,route,scenario:'bulk-action-modal',selected,barVisible,activated:bulkActivated,visiblePanel:bulkModal,...bulkDetail})
          if (width <= 320 && bulkModal) {
            const snap = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})
            writeFileSync(resolve(screenshotFolder,'vocabulary-bulk-modal-'+width+'-'+theme+'.png'),Buffer.from(snap.data,'base64'))
          }
          await send('Page.navigate',{url:base+route})
          await pause(950)
          const managerActivated = await evaluate("(() => {const button=[...document.querySelectorAll('button')].find(el=>el.classList.contains('min-h-9')&&el.classList.contains('max-w-full'));if(!button)return false;button.click();return true})()")
          await pause(500)
          const managerOpened = await evaluate("Boolean(document.querySelector('[role=\"dialog\"][aria-modal=\"true\"]'))")
          const backdropClickKeepsOpen = await evaluate("(() => {const overlay=document.querySelector('[role=\"dialog\"]');if(!overlay)return false;overlay.dispatchEvent(new MouseEvent('click',{bubbles:true}));return Boolean(document.querySelector('[role=\"dialog\"]'))})()")
          const managerDetail = await evaluate(measurement.replace('const viewport = window.innerWidth', 'const viewport = '+width))
          scenarioResults.push({theme,width,route,scenario:'per-word-tab-manager',activated:managerActivated,visiblePanel:managerOpened,backdropClickKeepsOpen,...managerDetail})
          if (width <= 320 && managerOpened) {
            const snap = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})
            writeFileSync(resolve(screenshotFolder,'vocabulary-tab-manager-'+width+'-'+theme+'.png'),Buffer.from(snap.data,'base64'))
          }
        }
        if (width <= 390 && route === '/profile') {
          const accountActivated = await evaluate("(() => {const b=[...document.querySelectorAll('header button[aria-haspopup=\"true\"]')].find(el=>String(el.className).includes('lg:hidden'));if(!b)return false;b.click();return true})()")
          await pause(1700)
          const visiblePanel = await evaluate("Boolean(document.querySelector('header nav.flex.flex-col a[href=\"/profile\"]'))")
          const longNameClipped = await evaluate("(() => {const name=[...document.querySelectorAll('header span')].find(el=>el.textContent?.includes('Mobile Audit')||el.textContent?.includes('Người dùng trải nghiệm'));if(!name)return null;return name.getBoundingClientRect().right <= window.innerWidth+2})()")
          const accountDetail = await evaluate(measurement.replace('const viewport = window.innerWidth', 'const viewport = '+width))
          scenarioResults.push({theme,width,route,scenario:'mobile-account-menu',activated:accountActivated,visiblePanel,longNameClipped,...accountDetail})
          if (width <= 320) {
            const snap = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})
            writeFileSync(resolve(screenshotFolder,'mobile-account-menu-'+width+'-'+theme+'.png'),Buffer.from(snap.data,'base64'))
          }
        }
        if (width <= 390 && route === '/profile') {
          const activated = await evaluate("(() => {const b=[...document.querySelectorAll('header button.group')].find(el=>el.getBoundingClientRect().width>0);if(!b)return false;b.click();return true})()")
          await pause(240)
          const panel = await evaluate("(() => {const e=[...document.querySelectorAll('header div.absolute')].find(el=>String(el.className).includes('w-56')&&String(el.className).includes('right-0'));if(!e)return null;const r=e.getBoundingClientRect();return {left:Math.round(r.left),right:Math.round(r.right),fits:r.left>=-2&&r.right<=window.innerWidth+2}})()")
          const detail = await evaluate(measurement.replace('const viewport = window.innerWidth', 'const viewport = '+width))
          scenarioResults.push({theme,width,route,scenario:'mobile-language-popover',activated,visiblePanel:Boolean(panel),panel,...detail})
          if(width<=320 && panel) {
            const snap=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})
            writeFileSync(resolve(screenshotFolder,'mobile-language-popover-'+width+'-'+theme+'.png'),Buffer.from(snap.data,'base64'))
          }
        }
        if (width <= 390 && (route === '/categories' || route === '/tags')) {
          const activated = await evaluate(`(() => {const button=document.querySelector('h1')?.parentElement?.parentElement?.querySelector('button');if(!button)return false;button.click();return true})()`)
          await pause(350)
          const detail = await evaluate(measurement.replace('const viewport = window.innerWidth', 'const viewport = '+width))
          const visiblePanel = await evaluate(`Boolean(document.querySelector('div.fixed.inset-0.z-50'))`)
          scenarioResults.push({theme,width,route,scenario:'category-tag-modal',activated,visiblePanel,...detail})
          if (width <= 320 && visiblePanel) {
            const snap = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})
            writeFileSync(resolve(screenshotFolder,(route==='/categories'?'category-modal':'tag-modal')+'-'+width+'-'+theme+'.png'),Buffer.from(snap.data,'base64'))
          }
        }
        if (width <= 390 && route === '/about') {
          await evaluate(`document.querySelector('header div.flex.items-center > button:last-child')?.click()`)
          await pause(220)
          const nav = await evaluate(`Boolean(document.querySelector('header nav.flex.flex-col'))`)
          scenarioResults.push({theme,width,route,scenario:'header-mobile-menu',visiblePanel:nav})
        }
      }
    }
  }
  writeFileSync(output,JSON.stringify({timestamp:new Date().toISOString(),widths,height,locale,longContent,themes,routes,results,scenarios:scenarioResults,errors,consoleWarnings},null,2))
  const overflow=results.filter(x=>x.scrollWidth>x.width+2||x.overflowing?.length)
  const failedRender=results.filter(x=>!x.visibleCount || x.layoutViewport !== x.width)
  const failedInteractions=scenarioResults.filter(x=>
    x.visiblePanel !== true || x.activated === false || x.selected === false ||
    x.barVisible === false || x.backdropClickKeepsOpen === false ||
    x.longNameClipped === false || x.panel?.fits === false ||
    x.scrollWidth > x.width+2 || x.overflowing?.length > 0)
  console.log('AUDIT '+results.length+' samples; '+overflow.length+' overflow samples; '+
    failedRender.length+' failed renders; '+failedInteractions.length+' failed interactions; '+
    errors.length+' JS exceptions')
  console.log('REPORT '+output)
  if(overflow.length || failedRender.length || failedInteractions.length || errors.length) {
    console.error('Responsive audit failed. Inspect '+output)
    process.exitCode=1
  }
} finally {
  try {socket?.close()} catch{}
  for (const child of children.reverse()) {
    if(child?.pid) try {execFileSync('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true})}catch{try{child.kill()}catch{}}
  }
  try{rmSync(tempDir,{recursive:true,force:true})}catch{}
}
