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
const defaultLocaleAudit = process.argv.includes('--default-locale')
const posAudit = process.argv.includes('--pos-only')
const noteAudit = process.argv.includes('--note-only')
const layoutAudit = process.argv.includes('--layout-only')
const seasonalAudit = process.argv.includes('--seasonal-only')
const uploadAudit = process.argv.includes('--upload-only')
const synonymAudit = process.argv.includes('--synonym-only')
const drawerAudit = process.argv.includes('--drawer-only')
const longContent = process.argv.includes('--long-content')
const themes = themeFlag === 'both' ? ['light', 'dark'] : [themeFlag]
const base = 'http://127.0.0.1:5199'
const api = 'http://127.0.0.1:3055'
const output = resolve(root, 'tests', 'responsive-audit-report.json')
const screenshotFolder = resolve(root, 'tests', 'responsive-screenshots')
const screenshots = new Set(['/', '/login', '/forgot-password', '/register', '/vocabulary', '/practice', '/srs', '/voice-settings', '/about', '/learning-progress', '/history', '/profile', '/favorites', '/categories', '/tags'])
const scenarioResults = []
const selectedRoutes = process.argv.find((arg) => arg.startsWith('--routes='))?.slice(9)?.split(',')
const defaultRoutes = ['/', '/about', '/login', '/forgot-password', '/register', '/vocabulary', '/vocabulary/by-date',
  '/favorites', '/history', '/profile', '/voice-settings', '/categories', '/categories/audit-category',
  '/tags', '/tags/audit-tag', '/practice', '/srs', '/learning-progress']
const routes = selectedRoutes || defaultRoutes
const guestRoutes = new Set(['/login', '/forgot-password', '/register'])
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
if (posAudit) { words[0].partOfSpeech='noun'; words[1].partOfSpeech='adjective'; words[0].meaning='building design'; words[1].pronunciation='/test/' }
const posWrites = [];
const synonymWrites=[];
if(synonymAudit){words[0].partOfSpeech='noun';words[0].synonyms=[{word:'design',pronunciation:'/design/',partOfSpeech:'verb',meaning:'design-specific-meaning'},{word:'construction',pronunciation:''},...Array.from({length:18},(_,i)=>({word:'Related '+(i+1),pronunciation:'/test/',partOfSpeech:'noun'}))];}
const tabRequests=[];
const auditTabs=[{id:'tab1',name:'English',icon:'book',vocabularies:words}];
let uploadActive=null;
function mockPayload(url, method, postData, currentRoute) {
  const path = new URL(url).pathname
  if (path === '/auth/me') return user
  if (path === '/auth/recalculate-words') return {totalWords:12}
  if (path === '/auth/theme') return {success:true}
  if (path === '/auth/forgot-password/request') return {message:'If the email is registered, we will send a verification code.'}
  if (path === '/auth/forgot-password/reset') return {success:true}
  if(uploadAudit && path==='/vocabulary-tabs/upload-icon'){tabRequests.push({method:'legacy',body:{}});return {url:'/uploads/legacy.png'};}
  if(uploadAudit && path==='/vocabulary-tabs' && method==='POST'){
    const body=JSON.parse(postData||'{}');tabRequests.push({method,body});
    const row={id:'audit-upload-tab',name:body.name,icon:'/uploads/tab-icons/123e4567-e89b-12d3-a456-426614174000.png',vocabularies:[]};
    auditTabs.push(row);return row;
  }
  if(uploadAudit && path.startsWith('/vocabulary-tabs/') && method==='PATCH'){
    const body=JSON.parse(postData||'{}');tabRequests.push({method,body});
    const row=auditTabs.find(t=>t.id===path.split('/')[2]);if(row)row.icon='/uploads/tab-icons/123e4567-e89b-12d3-a456-426614174001.png';return row;
  }
  if(uploadAudit && path==='/vocabulary-tabs') return auditTabs;
  if(uploadAudit && path==='/vocabulary/settings/active-tab'){uploadActive=JSON.parse(postData||'{}').tabId;return {success:true};}
  if(uploadAudit && path==='/vocabulary/settings')return {isFilterExpanded:false,isAllTabHidden:false,activeTabId:uploadActive};
  if (path === '/vocabulary-tabs') return [{id:'tab1', name:'English', icon:'book', vocabularies:words}]
  if (path === '/vocabulary/settings') return {isFilterExpanded: false, isAllTabHidden:false, activeTabId:null}
  if(synonymAudit && path.endsWith('/selected-synonym') && method==='PATCH') {
    const row=words.find(w=>w.id===path.split('/')[2])||synonymWrites.find(w=>w.id===path.split('/')[2]);
    const body=JSON.parse(postData||'{}'); if(!row)return null; row.selectedSynonym=body.selectedSynonym; return {id:row.id,selectedSynonym:row.selectedSynonym};
  }
  if(synonymAudit && path==='/vocabulary/check-duplicate') return {duplicate:false,total:0,matches:[]};
  if(synonymAudit && path==='/vocabulary' && method==='POST'){
    const body=JSON.parse(postData||'{}');const row={...body,id:'audit-synonym-word',createdAt:'2026-11-25T15:00:00Z',updatedAt:'2026-11-25T15:00:00Z'};synonymWrites.splice(0,synonymWrites.length,row);return row;
  }
  if(synonymAudit && path.startsWith('/vocabulary/') && method==='PUT'){
    const row=words.find(w=>w.id===path.split('/')[2])||synonymWrites.find(w=>w.id===path.split('/')[2]);
    if(row)Object.assign(row,JSON.parse(postData||'{}'));return row;
  }
  if(synonymAudit && path==='/vocabulary' && method==='GET')return {data:[...words,...synonymWrites],meta:{page:1,limit:6,total:words.length+synonymWrites.length,pageCount:1}};
  if (posAudit && path === '/vocabulary/check-duplicate') {
    const params=new URL(url).searchParams;
    const norm=v=>String(v||'').trim().replace(/\s+/g,' ').toLowerCase();
    const matches=words.filter(w=>w.id!==params.get('excludeId')&&norm(w.word)===norm(params.get('word')));
    return {total:matches.length,matches,duplicate:matches.some(w=>norm(w.meaning)===norm(params.get('meaning'))&&(w.partOfSpeech===params.get('partOfSpeech')||params.get('partOfSpeech')==='unspecified'))};
  }
  if (posAudit && path === '/vocabulary' && method === 'POST') {
    const entry={...JSON.parse(postData||'{}'),id:'audit-pos-created',createdAt:'2026-11-25T15:00:00Z',updatedAt:'2026-11-25T15:00:00Z'};
    posWrites.push(entry);
    return entry;
  }
  if (posAudit && path === '/vocabulary' && method === 'GET') {
    const part=new URL(url).searchParams.get('partOfSpeech');
    const data=[...posWrites,...words].filter(w=>!part||w.partOfSpeech===part);
    return {data,meta:{page:1,limit:6,total:data.length,pageCount:1}};
  }
  if (noteAudit && path.startsWith('/vocabulary/') && method === 'PUT') {
    const word=words.find(w=>w.id===path.split('/')[2]);
    const patch=JSON.parse(postData||'{}');
    if (!word || Object.keys(patch).length!==1 || typeof patch.note!=='string') return null;
    Object.assign(word,patch);
    return word;
  }
  if (path === '/vocabulary' || path === '/vocabulary/favorites/list') return {data:words, items:words, vocabularies:words, total:2, page:1, limit:20, totalPages:1}
  if (path === '/vocabulary/by-learning-date') return []
  if (path === '/category/bulk' && method === 'POST') {
    const body = JSON.parse(postData || '{}')
    return {processedIds:body.ids || [],failedIds:[]}
  }
  if (path === '/category/page') {
    const params = new URL(url).searchParams
    const all = Array.from({length: 19}, (_,i)=>({id:'audit-category-'+(i+1),name:i===0?'Travel':'Topic '+String(i+1).padStart(2,'0'),description:i===0?'Airport guide':'General',icon:'book',color:'#3B82F6',isPinned:i===0,vocabularyCount:i===0?2:0,createdAt:'2026-11-21T09:00:00Z',updatedAt:'2026-11-21T09:00:00Z'}))
    for (let i = 0; i < all.length; i++) {
      const c = all[i]
      if (i===1) c.color='#FFFFFF'
      if (i===2) c.color='#000000'
      if (i===3) {c.icon='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABpElEQVR4nO2bW24CMQxFL90DLBF2UUR3AUssi2i/IkGaOC8ntlPfLwSTkc+JMzNBAHg8nv+cQ8+g8+f3D3chXHl8nZqYmg7WDB6nVkTVQZbA45REfJROYBkeKNdPCrAOH0JxZAXsAh+S4ykugd2TFLDb7IekuLwD4jd2nf2QmM87QLoA6bgA6QKk4wKkC+jJ/XZkO5c5AQGeS4IpATH0/XYcFmFGAAU6IsGMACqX67N7rAkB1AyPwAMGBMyEB5QL4Lzd5aJWQAmeY/YBpQJWwQMKBayEB5QJWA0PKBNAZQY8wCxg5Ko9+3aXC5uAkU2KFDzAJCC1SekduzrDAnIANWASF704wwKoIkd2cCvgAaYl0CpBCzzAeBGslaAJHmC+DfYuh5rxs8L+INQrQQIemPQk2AojBQ9MfBSWhGrJ1L1AjQRpUdM3QxSgNDywaDcYQC/X59trDVm2HX4F1gIPGPo+YFZcgHQB0nEB0gVI54+A1t/bW0vM5x2QenPXLkhxeQfkPtitC3I8ZAfsIoHiKC4B6xJK9fu/xnpOrlmE9Y71eBbnF2Jpom7xpbEyAAAAAElFTkSuQmCC'; c.color='#a855f7'}
      if (i===4) {c.color=undefined; c.icon=undefined; c.description=''}
      if (i===5) c.description='Long description '+ 'X'.repeat(200)
      c.smart = {recentActivityCount:i===0?9:i===2?3:0,idleDays:i===1?42:i===4?20:1,hasStudied:i!==4,needsReview:i===1||i===4,isInterested:i===0||i===2}
    }
    const smart = params.get('smart') || 'all'
    let filtered = all.filter(c => {
      const search = (params.get('search')||'').toLowerCase()
      return (!search || (c.name+' '+c.description).toLowerCase().includes(search)) &&
        (params.get('pinned')!=='pinned' || c.isPinned) &&
        (params.get('pinned')!=='unpinned' || !c.isPinned) &&
        (params.get('content')!=='populated' || c.vocabularyCount>0) &&
        (params.get('content')!=='empty' || c.vocabularyCount===0) && (smart==='all' || smart==='interested' && c.smart.isInterested || smart==='neglected' && c.smart.needsReview || smart==='recommended' && (c.smart.isInterested || c.smart.needsReview))
    })
    if (smart === 'recommended') filtered.sort((a,b)=>Number(b.smart.needsReview)-Number(a.smart.needsReview)||b.smart.idleDays-a.smart.idleDays)
    const pageCount = Math.max(1,Math.ceil(filtered.length/8))
    const page = Math.min(Number(params.get('page')||1),pageCount)
    return {data:filtered.slice((page-1)*8,page*8),total:filtered.length,totalCategories:all.length,page,pageCount,limit:8,smartSummary:{interested:2,neglected:2,recommended:4}}
  }
  if (path === '/category') return Array.from({length:150},(_,i)=>({id:'audit-filter-cat-'+i,name:i===149?'\u0110\u1ED3 \u0103n '+ 'X'.repeat(120):'Category '+String(i+1).padStart(3,'0'),icon:'folder',color:'#3B82F6'}))
  if (path === '/tag' && method === 'POST') return {id:'audit-created-tag',...JSON.parse(postData||'{}'),createdAt:'2026-11-25T12:00:00Z',updatedAt:'2026-11-25T12:00:00Z'}
  if (path.startsWith('/tag/') && method === 'PUT') return {id:path.split('/')[2],...JSON.parse(postData||'{}'),createdAt:'2026-11-24T12:00:00Z',updatedAt:'2026-11-25T12:00:00Z'}
  if (path === '/tag' && currentRoute === '/tags') return Array.from({length:8},(_,i)=>({id:'audit-tag-'+i,name:i===3?'VeryLongTag'+'X'.repeat(120):'Tag '+String(i+1).padStart(2,'0'),description:i===0?'Useful vocabulary for everyday practice':i===3?'Long description '+ 'X'.repeat(120):'',color:['#FFFFFF','#000000','#A855F7','#3B82F6'][i%4],createdAt:'2026-11-24T12:00:00Z',updatedAt:'2026-11-24T12:00:00Z'}))
  if (path === '/tag') return Array.from({length:200},(_,i)=>({id:'audit-filter-tag-'+i,name:i===199?'LongTag'+'X'.repeat(120):'Tag '+String(i+1).padStart(3,'0'),color:'#6366F1'}))
  if (path === '/category/audit-category/vocabularies') return {id:'audit-category',name:'Travel and everyday vocabulary',description:'Useful words for trips, airports and conversations.',icon:'plane',color:'#FFFFFF',isPinned:true,vocabularies:words.map(w=>({...w,categories:[{id:'audit-category',name:'Travel',icon:'plane',color:'#FFFFFF'}],correctCount:3,incorrectCount:1}))}
  if (path === '/category/audit-custom/vocabularies') {
    const item=mockPayload(new URL('/category/page',url).href,'GET').data[3]
    return {...item,id:'audit-custom',vocabularies:[]}
  }
  if (path === '/category/audit-empty/vocabularies') return {id:'audit-empty',name:'Empty category',color:'#000000',icon:'book',vocabularies:[]}
  if (path.startsWith('/category')) return path === '/category' ? [] : {id:'audit-category',name:'Demo',vocabularies:[]}
  if (path.startsWith('/tag')) return path === '/tag' ? [] : {id:'audit-tag',name:'Demo',vocabularies:[]}
  if (path === '/history/statistics') return {totalActivities:0,vocabulary:{total:0,created:0,updated:0,deleted:0},practice:{totalPractices:0,accuracy:0,totalScore:0}}
  if (path.startsWith('/history')) return {data:[],items:[],total:0,page:1,totalPages:0}
  if(synonymAudit && path==='/srs/queue') return [{...words[0],isNew:true,isPracticeOnly:false,repetitions:0,lapses:0,intervalDays:0,nextReviewAt:null,synonyms:Array.from({length:20},(_,i)=>({word:'Related word '+(i+1),pronunciation:'/test/',partOfSpeech:i===0?'verb':'noun',meaning:i===0?'specific review meaning':undefined}))}];
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
async function evaluate(expression, timeout=30000) {
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
      const content=JSON.stringify(mockPayload(request.url,request.method,request.postData,currentRoute))
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
      if(synonymAudit){user.vocabularyLayout=width<768?'grid':'list';synonymWrites.length=0;}
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true,screenWidth:width,screenHeight:height})
      for (const route of routes) {
        currentRoute=route
        await evaluate(`localStorage.setItem('theme',${JSON.stringify(theme)});${defaultLocaleAudit?"localStorage.removeItem('locale')":"localStorage.setItem('locale',"+JSON.stringify(locale)+")"};localStorage.${guestRoutes.has(route)?'removeItem':'setItem'}('token'${guestRoutes.has(route)?'':",'mobile-audit-only'"});`)
        await send('Page.navigate',{url:base+route},30000)
        await pause(900)
        if (seasonalAudit && route === '/profile') {
          for (let attempt=0;attempt<2;attempt++) {
            const ready=await evaluate(`(async()=>{for(let i=0;i<300;i++){if(document.querySelector('[data-seasonal-preview-action]'))return true;await new Promise(r=>setTimeout(r,100))}return false})()`,35000);
            if(ready===true) break;
            await evaluate(`localStorage.setItem('token','mobile-audit-only');localStorage.setItem('theme',${JSON.stringify(theme)});localStorage.setItem('locale',${JSON.stringify(locale)})`);
            await send('Page.navigate',{url:base+route},30000);
          }
        }
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
        if (seasonalAudit && route === '/profile') {
          const checks = await evaluate(`(async () => {
            const wait = async f => { for(let i=0;i<150;i++){if(f())return true;await new Promise(r=>setTimeout(r,100))}return false };
            const preview=()=>document.querySelector('[data-seasonal-preview-action]');
            const trigger=()=>document.querySelector('[aria-labelledby="seasonal-preferences-title"] button[aria-haspopup="listbox"]');
            const list=()=>[...document.querySelectorAll('[role="listbox"] [role="option"]')];
            const results=[];
            if(!await wait(()=>preview()&&trigger()))return {ready:false,results};
            for(let index=0;index<11;index++){
              document.querySelector('[data-seasonal-preview-exit]')?.click();
              await wait(()=>!document.body.dataset.seasonalEvent);
              let opened=false;
              for(let retry=0;retry<5&&!opened;retry++){
                trigger().scrollIntoView({block:'center',behavior:'instant'});
                await new Promise(r=>setTimeout(r,500));
                if(trigger().getAttribute('aria-expanded')!=='true')trigger().click();
                for(let i=0;i<10;i++){await new Promise(r=>setTimeout(r,80));if(list().length===11&&trigger().getAttribute('aria-expanded')==='true'){opened=true;break}}
              }
              if(!opened)return {ready:false,results,options:list().length,rect:trigger().getBoundingClientRect().toJSON()};
              list()[index].click();
              await wait(()=>!document.querySelector('[role="listbox"]'));
              preview().click();
              await wait(()=>document.body.dataset.seasonalEvent && document.querySelector('.seasonal-footer-scene img')?.complete && document.querySelector('.seasonal-hero-secondary')?.complete && document.querySelector('.seasonal-particle'));
              window.scrollTo({top:0,behavior:'instant'});
              await wait(()=>Math.abs(document.querySelector('.seasonal-header').getBoundingClientRect().top)<1);
              await wait(()=>document.querySelector('.seasonal-hero-art')?.naturalWidth>0);
              const footer=document.querySelector('.seasonal-footer');
              const orig=document.querySelector('.seasonal-hero-art');
              const scene=document.querySelector('.seasonal-hero-secondary');
              const footerArt=document.querySelector('.seasonal-footer-scene img');
              const particles=[...document.querySelectorAll('.seasonal-particle')].filter(p=>getComputedStyle(p).display!=='none');
              await new Promise(r=>setTimeout(r,350));
              const frame=document.querySelector('.seasonal-frame');
              const edges=[...document.querySelectorAll('.seasonal-frame-edge')];
              const logos=[...document.querySelectorAll('.seasonal-header .app-brand-link,.seasonal-footer .app-brand-link')];
              const frameOk=!!frame&&getComputedStyle(frame).pointerEvents==='none'&&edges.length===4&&edges.every(e=>getComputedStyle(e,'::before').backgroundImage!=='none'&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0);
              const shell=document.querySelector('.app-shell');
              const header=document.querySelector('.seasonal-header');
              const shellStyle=getComputedStyle(shell);
              const frameRect=frame?.getBoundingClientRect();
              const near=(a,b)=>Math.abs(a-b)<1.1;
              const edgeRects=edges.map(e=>e.getBoundingClientRect());
              const flush=!!frameRect&&[shellStyle.paddingTop,shellStyle.paddingRight,shellStyle.paddingBottom,shellStyle.paddingLeft,getComputedStyle(header).top].every(v=>v==='0px')&&near(frameRect.left,0)&&near(frameRect.top,0)&&near(frameRect.right,innerWidth)&&near(frameRect.bottom,innerHeight)&&near(edgeRects[0]?.top,0)&&near(edgeRects[0]?.left,0)&&near(edgeRects[0]?.right,innerWidth)&&near(edgeRects[1]?.right,innerWidth)&&near(edgeRects[2]?.bottom,innerHeight)&&near(edgeRects[3]?.left,0)&&near(header.getBoundingClientRect().left,0)&&near(footer.getBoundingClientRect().left,0)&&near(header.getBoundingClientRect().width,innerWidth)&&near(footer.getBoundingClientRect().width,innerWidth);
              const artworkOnly=edges.every(e=>{const s=getComputedStyle(e,'::before');return s.backgroundColor==='rgba(0, 0, 0, 0)'&&s.backgroundImage.startsWith('url(')&&s.backgroundPosition.includes('85%')&&s.backgroundPosition.includes('100%')});
              const headerInner=header.querySelector('.seasonal-header-inner');
              const headBox=headerInner.getBoundingClientRect();
              const brandBox=logos[0]?.getBoundingClientRect();
              const headerSafe=headBox.top>=edgeRects[0].bottom-.5&&headBox.left>=edgeRects[3].right-.5&&headBox.right<=edgeRects[1].left+.5&&brandBox.top>=edgeRects[0].bottom+6;
              footer.scrollIntoView({block:'end',behavior:'instant'});
              await wait(()=>Math.abs(footer.getBoundingClientRect().bottom-innerHeight)<2);
              const bottom=footer.querySelector('.seasonal-footer-bottom')?.getBoundingClientRect();
              const footRect=footer.getBoundingClientRect();
              const footerSafe=!!bottom&&footRect.bottom-bottom.bottom>=edgeRects[2].height-.5&&bottom.left>=edgeRects[3].right-.5&&bottom.right<=edgeRects[1].left+.5;
              const footDebug=footerSafe?undefined:{bottom:bottom?.toJSON(),footer:footRect.toJSON(),edge:edgeRects[2].toJSON(),padding:getComputedStyle(footer).padding};
              const logoOk=logos.length===2&&logos.every(e=>getComputedStyle(e).boxShadow==='none'&&getComputedStyle(e).textDecorationLine==='none')&&logos[0].querySelector('svg path')?.getAttribute('d')===logos[1].querySelector('svg path')?.getAttribute('d');
              results.push({frameOk,flush,artworkOnly,headerSafe,footerSafe,footDebug,logoOk,id:document.body.dataset.seasonalEvent,footerBg:footer&&getComputedStyle(footer).backgroundColor,original:!!orig?.naturalWidth&&orig.src.includes('.webp'),supplement:!!scene?.naturalWidth&&!!footerArt?.naturalWidth,particles:particles.length,overflow:document.documentElement.scrollWidth>innerWidth+2});
            }
            // Real SPA navigation keeps the active preview and exercises vocabulary tabs.
            const vocabLink=document.querySelector('.seasonal-header a[href="/vocabulary"], .seasonal-footer a[href="/vocabulary"]');
            vocabLink?.click();
            const tabsReady=await wait(()=>document.querySelector('.vocab-tabs-wrapper .app-choice-tab'));
            const tabButtons=[...document.querySelectorAll('.vocab-tabs-wrapper .app-choice-tab')];
            const checkTabs=()=>{const buttons=[...document.querySelectorAll('.vocab-tabs-wrapper .app-choice-tab')];return buttons.length>1&&buttons.filter(b=>b.getAttribute('aria-pressed')==='true').length===1&&buttons.every(b=>{
              const s=getComputedStyle(b,'::after'), transform=new DOMMatrixReadOnly(s.transform);
              const active=b.getAttribute('aria-pressed')==='true';
              return (b.classList.contains('vocabulary-tab-main')?Math.abs(b.getBoundingClientRect().height-36)<.5&&getComputedStyle(b).flexDirection==='row':b.getBoundingClientRect().height<=54)&&(active?s.content!=='none'&&s.position==='absolute'&&s.top==='0px'&&transform.m42<0&&getComputedStyle(b).overflow==='visible'&&s.pointerEvents==='none':s.content==='none'||s.content==='normal');
            });};
            const initialTabs=!!tabsReady&&checkTabs();
            const nextTab=tabButtons.find(b=>b.getAttribute('aria-pressed')==='false');
            nextTab?.click();
            await wait(()=>nextTab?.getAttribute('aria-pressed')==='true');
            const tabsOutside=initialTabs&&nextTab?.getAttribute('aria-pressed')==='true'&&checkTabs();
            document.querySelector('[data-seasonal-preview-exit]')?.click();
            await wait(()=>!document.body.dataset.seasonalEvent);
            return {ready:true,tabsOutside,cleared:!document.body.dataset.seasonalEvent&&!document.querySelector('.seasonal-frame'),results};
          })()`,120000);
          const expectedBg=theme==='dark'?'rgb(0, 0, 0)':'rgb(255, 255, 255)';
          const activated=checks?.ready===true && checks.tabsOutside===true && checks.cleared===true && new Set(checks.results.map(r=>r.id)).size===11 && checks.results.every(r=>r.footerBg===expectedBg && r.original && r.supplement && r.particles>0 && r.frameOk && r.flush && r.artworkOnly && r.headerSafe && r.footerSafe && r.logoOk && !r.overflow);
          scenarioResults.push({theme,width,route,scenario:'seasonal-all-previews',activated,visiblePanel:activated,...checks});
          console.log('SEASONAL '+theme+' '+width+' '+JSON.stringify({activated,...checks}));
          continue;
        }
        if (defaultLocaleAudit && route === '/login') {
          const initial = await evaluate(`(async () => {
            const wait=async f=>{for(let i=0;i<50;i++){if(f())return true;await new Promise(r=>setTimeout(r,100))}return false};
            const root=()=>document.querySelector('[data-language-switcher]');
            const ready=await wait(()=>root()?.querySelector('button'));
            if(!ready)return {ready:false};
            const defaultEnglish=document.documentElement.lang==='en' && !!root().querySelector('.fi-us');
            root().querySelector('button').click();
            await wait(()=>root().querySelectorAll('[data-language-code]').length===4);
            const options=()=>[...root().querySelectorAll('[data-language-code]')];
            const ordered=options().map(x=>x.dataset.languageCode).join(',')==='en,vi,ko,zh-CN';
            const selected=options()[0]?.getAttribute('aria-pressed')==='true';
            options()[1]?.click();
            await wait(()=>document.documentElement.lang==='vi');
            const saved=localStorage.getItem('locale')==='vi'&&document.documentElement.lang==='vi';
            return {ready,defaultEnglish,ordered,selected,saved};
          })()`)
          await send('Page.navigate',{url:base+route},30000)
          await pause(1100)
          const persisted=await evaluate("document.documentElement.lang==='vi' && localStorage.getItem('locale')==='vi'")
          scenarioResults.push({theme,width,route,scenario:'default-language-order',activated:Object.values(initial).every(v=>v===true)&&persisted,visiblePanel:initial.ordered===true,...initial,persisted})
        }
        if (width <= 390 && route === '/login') {
          let linkWorks = false
          for (let attempt = 0; attempt < 12 && !linkWorks; attempt++) {
            linkWorks = await evaluate("Boolean(document.querySelector('a[href=\"/forgot-password\"]'))")
            if (!linkWorks) await pause(150)
          }
          scenarioResults.push({theme,width,route,scenario:'forgot-password-link',visiblePanel:linkWorks})
        }
        if (width <= 390 && route === '/forgot-password') {
          const enter = async (selector, value) => evaluate(`(() => {
            const field=document.querySelector(${JSON.stringify(selector)});
            if (!field) return false;
            const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
            setter.call(field,${JSON.stringify(value)});
            field.dispatchEvent(new Event('input',{bubbles:true}));
            return true;
          })()`)
          const emailEntered = await enter('input[name="email"]','audit@example.invalid')
          await evaluate("document.querySelector('form')?.requestSubmit()")
          await pause(350)
          const otpReady = await evaluate("Boolean(document.querySelector('input[name=\"one-time-code\"]'))")
          let successVisible = false
          if (otpReady) {
            await enter('input[name="one-time-code"]','123456')
            await enter('input[name="new-password"]','a-new-password-strong')
            await enter('input[name="confirm-password"]','a-new-password-strong')
            await evaluate("document.querySelector('form')?.requestSubmit()")
            await pause(350)
            successVisible = await evaluate("Boolean(document.querySelector('a[href=\"/login\"].bg-gradient-to-r'))")
          }
          const detail=await evaluate(measurement.replace('const viewport = window.innerWidth', 'const viewport = '+width))
          scenarioResults.push({theme,width,route,scenario:'forgot-password-3-steps',activated:emailEntered&&otpReady,visiblePanel:successVisible,...detail})
        }

        if (uploadAudit && route === '/vocabulary') {
          tabRequests.length=0;
          const result=await evaluate(`(async()=>{
            const wait=async f=>{for(let i=0;i<70;i++){if(f())return true;await new Promise(r=>setTimeout(r,100))}return false};
            const modal=()=>document.querySelector('#vocabulary-tab-editor');
            const add=()=>document.querySelector('[data-tab-create]');
            const ready=await wait(()=>add());
            if(!ready)return {ready:false};
            const pick=()=>{
              const data=new DataTransfer();
              const canvas=document.createElement('canvas');canvas.width=canvas.height=2;
              const bytes=Uint8Array.from(atob(canvas.toDataURL().split(',')[1]),c=>c.charCodeAt(0));
              data.items.add(new File([bytes],'icon.png',{type:'image/png'}));
              const input=modal().querySelector('input[type="file"]');
              input.files=data.files; input.dispatchEvent(new Event('change',{bubbles:true}));
            };
            add().click();await wait(()=>modal());pick();
            document.querySelector('[role="dialog"] header button').click();
            const cancelled=await wait(()=>!modal());
            add().click();await wait(()=>modal());pick();pick();
            const name=modal().querySelector('input[type="text"]');
            name.value='Uploaded icon';name.dispatchEvent(new Event('input',{bubbles:true}));
            await wait(()=>!document.querySelector('button[form="vocabulary-tab-editor"]').disabled);
            document.querySelector('button[form="vocabulary-tab-editor"]').click();
            const saved=await wait(()=>!modal()&&document.body.innerText.includes('Uploaded icon'));
            const active=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='English');
            active?.click();
            const edit=()=>document.querySelector('[data-tab-edit]');
            const editable=await wait(()=>edit());edit()?.click();
            const editing=await wait(()=>modal());
            if(!editing)return {ready,cancelled,saved,editable,editing};
            pick();
            document.querySelector('button[form="vocabulary-tab-editor"]').click();
            const updated=await wait(()=>!modal());
            return {ready,cancelled,saved,editable,editing,updated};
          })()`,45000)
          const atomic=tabRequests.length===2&&tabRequests[0].method==='POST'&&tabRequests[1].method==='PATCH'&&tabRequests.every(x=>x.body.iconData?.startsWith('data:image/png;base64,'));
          scenarioResults.push({theme,width,route,scenario:'tab-upload-atomic',...result,atomic,activated:Object.values(result).every(v=>v===true)&&atomic,visiblePanel:result.saved===true});
          continue;
        }
        if (synonymAudit && route === '/vocabulary') {
          const check=await evaluate(`(async()=>{
            const wait=async f=>{for(let i=0;i<75;i++){if(f())return true;await new Promise(r=>setTimeout(r,100))}return false};
            const root=()=>document.querySelector('[data-word-switcher]');
            const trigger=()=>root()?.querySelector('[data-synonym-switch] button');
            const ready=await wait(()=>trigger());
            if(!ready)return {ready:false};
            const original=root().querySelector('[data-displayed-word]').textContent.trim()==='architecture';
            trigger().scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,350));trigger().click();
            await wait(()=>document.querySelector('[role="option"]'));
            const list=document.querySelector('[role="listbox"]');
            await wait(()=>list.style.maxHeight&&list.scrollHeight>list.clientHeight);
            const fourth=list.children[3], fifth=list.children[4];
            const cap=!!fourth&&!!fifth&&list.clientHeight<=fourth.getBoundingClientRect().bottom-list.getBoundingClientRect().top+list.scrollTop+1&&list.scrollHeight>list.clientHeight;
            list.scrollTop=list.scrollHeight;
            await new Promise(r=>setTimeout(r,150));
            const last=list.lastElementChild;
            const scrolled=!!last&&list.scrollTop>0&&last.getBoundingClientRect().bottom<=list.getBoundingClientRect().bottom+1&&document.contains(list);
            list.scrollTop=0;
            [...document.querySelectorAll('[role="option"]')].find(b=>b.querySelector('span')?.textContent.trim()==='design')?.click();
            const switched=await wait(()=>root()?.querySelector('[data-displayed-word]')?.textContent.trim()==='design');
            await wait(()=>!trigger()?.disabled);
            const ipa=root()?.querySelector('[data-displayed-ipa]')?.textContent.trim()==='/design/';
            const posChanged=root()?.querySelector('[data-part-of-speech]')?.textContent.trim()==='Verb';
            const meaningChanged=document.body.innerText.includes('design-specific-meaning');
            const voice=root()?.querySelector('[data-synonym-speak]')?.getAttribute('aria-label')?.endsWith(': design');
            await new Promise(r=>setTimeout(r,250)); trigger()?.click();await wait(()=>document.querySelector('[role="option"]'));
            [...document.querySelectorAll('[role="option"]')].find(b=>b.querySelector('span')?.textContent.trim()==='architecture')?.click();
            const returned=await wait(()=>root()?.querySelector('[data-displayed-word]')?.textContent.trim()==='architecture');
            await wait(()=>!trigger()?.disabled);
            const fit=root().scrollWidth<=root().clientWidth+1;
            const modal=()=>document.querySelector('form[id^="vocabulary-form-"]');
            document.querySelector('button.add-button')?.click();
            const opened=await wait(()=>modal());
            if(!opened)return {ready,original,switched,ipa,voice,returned,fit,opened};
            const set=(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));};
            const inputs=modal().querySelectorAll('input[required]');
            set(inputs[0],'audit-happy');set(inputs[1],'/happy/');set(inputs[2],'happy meaning');
            const section=[...modal().querySelectorAll('section>button')].find(b=>b.textContent.includes('Synonyms'));
            section?.click();await wait(()=>document.querySelector('[data-synonym-editor]'));
            const editor=()=>document.querySelector('[data-synonym-editor]');
            [...editor().querySelectorAll('button')].find(b=>b.textContent.includes('Add synonym'))?.click();
            await wait(()=>editor().querySelector('input'));
            set(editor().querySelectorAll('input')[0],'joyful');await new Promise(r=>setTimeout(r,150));set(editor().querySelectorAll('input')[1],'/joyful/');await new Promise(r=>setTimeout(r,450));
            set(editor().querySelector('[data-synonym-meaning]'),'joyful-specific-meaning');await new Promise(r=>setTimeout(r,150));
            const pos=editor().querySelector('[data-synonym-pos] button');pos.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,300));pos.click();await wait(()=>document.querySelector('[role="option"]'));[...document.querySelectorAll('[role="option"]')].find(b=>b.textContent.trim()==='Adjective')?.click();await new Promise(r=>setTimeout(r,250));
            const add=()=>[...editor().querySelectorAll('button')].find(b=>b.textContent.includes('Add synonym'));
            const editorList=()=>editor().querySelector('[data-synonym-editor-list]');
            for(let i=1;i<5;i++){add()?.click();await wait(()=>editorList().children.length===i+1);set(editorList().lastElementChild.querySelector('input'),'Extra synonym '+i);await new Promise(r=>setTimeout(r,150));}
            await wait(()=>editorList().scrollHeight>editorList().clientHeight&&editorList().scrollTop>0);
            const editScroll=editorList().children.length===5&&editorList().scrollHeight>editorList().clientHeight&&editorList().scrollTop>0&&!editorList().contains(add());
            const save=document.querySelector('[data-vocabulary-save]');
            save?.click();
            const saved=await wait(()=>!modal()&&[...document.querySelectorAll('[data-displayed-word]')].some(el=>el.textContent.trim()==='audit-happy'));
            const edit=document.querySelector('[data-vocabulary-edit]');
            edit?.click();const editing=await wait(()=>modal());
            if(!editing)return {ready,original,switched,ipa,voice,returned,fit,opened,saved,editing};
            const syn=[...modal().querySelectorAll('section>button')].find(b=>b.textContent.includes('Synonyms'));
            syn?.click();await wait(()=>editor()?.querySelector('input'));
            const loaded=editor()?.querySelector('input')?.value==='design';
            if(loaded){set(editor().querySelectorAll('input')[1],'/updated/');await new Promise(r=>setTimeout(r,450));}
            document.querySelector('[data-vocabulary-save]')?.click();
            const edited=await wait(()=>!modal());
            return {ready,original,switched,ipa,voice,returned,fit,opened,saved,editing,loaded,edited,posChanged,cap,scrolled,editScroll,meaningChanged};
          })()`,45000)
          const sent=synonymWrites.some(w=>w.word==='audit-happy'&&w.synonyms?.[0]?.word==='joyful'&&w.synonyms[0].pronunciation==='/joyful/'&&w.synonyms[0].partOfSpeech==='adjective'&&w.synonyms[0].meaning==='joyful-specific-meaning')&&words[0].synonyms[0].pronunciation==='/updated/';
          words[0].synonyms[0].pronunciation='/design/';
          const chose=await evaluate(`(async()=>{const root=document.querySelector('[data-word-switcher]');const btn=root?.querySelector('[data-synonym-switch] button');if(!btn)return false;btn.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,300));btn.click();await new Promise(r=>setTimeout(r,300));[...document.querySelectorAll('[role="option"]')].find(b=>b.querySelector('span')?.textContent.trim()==='design')?.click();for(let i=0;i<60;i++){if(!btn.disabled&&root.querySelector('[data-displayed-word]')?.textContent.trim()==='design')return true;await new Promise(r=>setTimeout(r,100));}return false;})()`);
          const persisted=words[0].selectedSynonym==='design';
          await send('Page.reload',{ignoreCache:true},30000);
          const restored=await evaluate(`(async()=>{for(let i=0;i<80;i++){const root=document.querySelector('[data-word-switcher]');if(root?.querySelector('[data-displayed-word]')?.textContent.trim()==='design'&&root.querySelector('[data-part-of-speech]')?.textContent.trim()==='Verb'&&document.body.innerText.includes('design-specific-meaning'))return true;await new Promise(r=>setTimeout(r,100));}return false;})()`);
          Object.assign(check,{chose,persisted,restored});
          words[0].selectedSynonym=null;
          scenarioResults.push({theme,width,route,scenario:'synonym-switch-save',...check,sent,activated:Object.values(check).every(v=>v===true)&&sent,visiblePanel:check.fit===true});
          continue;
        }
        if (synonymAudit && route === '/srs') {
          const check=await evaluate(`(async()=>{
            const wait=async f=>{for(let i=0;i<70;i++){if(f())return true;await new Promise(r=>setTimeout(r,100))}return false};
            const btn=(text)=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text)&&!b.disabled);
            const started=await wait(()=>btn('Start smart review')||btn('Practice these words'));
            if(!started)return {started};
            (btn('Start smart review')||btn('Practice these words')).click();
            const question=await wait(()=>btn('Show answer'));
            if(!question)return {started,question};
            const hiddenBefore=!document.querySelector('[data-synonym-review]');
            btn('Show answer').click();
            const review=()=>document.querySelector('[data-synonym-review]');
            const ready=await wait(()=>review());
            if(!ready)return {started,question,hiddenBefore,ready};
            const trigger=()=>review().querySelector('button[aria-expanded]');
            const closed=trigger().getAttribute('aria-expanded')==='false'&&!review().querySelector('[data-synonym-review-list]');
            trigger().click();
            const opened=await wait(()=>review().querySelector('[data-synonym-review-list]'));
            const list=review().querySelector('[data-synonym-review-list]');
            await wait(()=>list.style.maxHeight.includes('min(')&&list.scrollHeight>list.clientHeight);
            const bounded=!!list&&list.scrollHeight>list.clientHeight&&list.clientHeight<=list.children[3].getBoundingClientRect().bottom-list.getBoundingClientRect().top+list.scrollTop+1;
            list.scrollTop=list.scrollHeight;await new Promise(r=>setTimeout(r,100));
            const scrolled=list.scrollTop>0&&list.lastElementChild.getBoundingClientRect().bottom<=list.getBoundingClientRect().bottom+1;
            const all=!!list&&list.querySelectorAll('button').length===20;
            const meanings=list.querySelector('[data-synonym-review-meaning]')?.textContent.trim()==='specific review meaning'&&list.querySelectorAll('[data-synonym-review-meaning]').length===20;
            const type=!!list&&[...list.querySelectorAll('[data-part-of-speech]')].some(x=>x.textContent.trim()==='Verb');
            const fit=review().scrollWidth<=review().clientWidth+1;
            trigger().click();
            const recollapsed=await wait(()=>trigger().getAttribute('aria-expanded')==='false'&&!review().querySelector('[data-synonym-review-list]'));
            return {started,question,hiddenBefore,ready,closed,opened,bounded,all,type,fit,recollapsed,scrolled,meanings};
          })()`,45000)
          scenarioResults.push({theme,width,route,scenario:'synonym-review-collapse',...check,activated:Object.values(check).every(v=>v===true),visiblePanel:check.fit===true});
          continue;
        }
        if (drawerAudit && route === '/vocabulary') {
          const check=await evaluate(`(async()=>{
            const wait=async f=>{for(let i=0;i<100;i++){if(f())return true;await new Promise(r=>setTimeout(r,100))}return false};
            const form=()=>document.querySelector('form[id^="vocabulary-form-"]');
            const drawer=()=>document.querySelector('[data-word-drawer]');
            const field=()=>drawer()?.querySelector('[data-drawer-word]');
            const confirm=()=>drawer()?.querySelector('[data-drawer-confirm]');
            const word=()=>form()?.querySelector('input[required]');
            const set=(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}))};
            const open=async()=>{form()?.querySelector('button[title="Open Word Drawing"]')?.click();return wait(()=>drawer()?.querySelector('canvas')?.getContext('2d'))};
            if(!await wait(()=>document.querySelector('button.add-button')))return {ready:false};
            document.querySelector('button.add-button').click();
            const ready=await wait(()=>form());
            if(!ready)return {ready};
            set(word(),'original');
            const opened=await open();
            if(!opened)return {ready,opened};
            const canvas=drawer().querySelector('canvas');await new Promise(r=>setTimeout(r,300));
            const initiallyDisabled=confirm().disabled;
            const rect=canvas.getBoundingClientRect(),x=rect.left+rect.width/3,y=rect.top+rect.height/3;
            for(const [type,xx,yy] of [['pointerdown',x,y],['pointermove',x+30,y+30],['pointerup',x+30,y+30]])canvas.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:1,pointerType:'mouse',isPrimary:true,button:0,buttons:type==='pointerup'?0:1,clientX:xx,clientY:yy}));
            const enabled=await wait(()=>!confirm()?.disabled);
            const staleCleared=field().value==='';
            const ctx=canvas.getContext('2d');
            const alphaCount=()=>{const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let n=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>8)n++;return n};
            const trace=()=>{for(const [type,xx,yy] of [['pointerdown',x,y],['pointermove',x+30,y+30],['pointerup',x+30,y+30]])canvas.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:1,pointerType:'mouse',isPrimary:true,button:0,buttons:type==='pointerup'?0:1,clientX:xx,clientY:yy}))};
            const tool=name=>drawer().querySelector('[data-drawer-tool="'+name+'"]');
            const background=name=>drawer().querySelector('[data-drawer-background="'+name+'"]');
            const action=name=>[...drawer().querySelectorAll('button')].find(b=>b.textContent.trim()===name);
            const size=drawer().querySelector('input[type="range"]');
            const previewPixel=async()=>{
              const img=drawer().querySelector('img[src^="data:image/png"]');
              if(!img)return null;
              await img.decode();const copy=document.createElement('canvas');copy.width=img.naturalWidth;copy.height=img.naturalHeight;
              const c=copy.getContext('2d');c.drawImage(img,0,0);
              return Array.from(c.getImageData(0,0,1,1).data).join(',');
            };
            const inkBefore=alphaCount();
            const dark=document.documentElement.classList.contains('dark');
            const backgroundPixel=dark?'0,0,0,255':'255,255,255,255';
            const canvasColor=dark?'rgb(0, 0, 0)':'rgb(255, 255, 255)';
            const themePreview=await previewPixel()===backgroundPixel;
            const inkPixel=()=>Array.from(ctx.getImageData(Math.round((x-rect.left)*canvas.width/rect.width),Math.round((y-rect.top)*canvas.height/rect.height),1,1).data);
            const defaultInkCorrect=inkPixel().slice(0,3).every(v=>v===(dark?255:0));
            const colors=await import('/src/components/common/composables/word-drawing/manager-state/drawingColors.ts');
            const palette=[...drawer().querySelectorAll('[data-drawer-color]')].map(b=>b.title);
            const paletteContrast=palette.length>=7&&palette.every(c=>colors.drawingContrast(c,dark)>=4.5);
            const ocr=await import('/src/components/common/composables/word-drawing/manager-handle/drawingRecognition.ts');
            const normalized=ocr.prepareDrawing(canvas);
            const pixels=normalized?.getContext('2d').getImageData(0,0,normalized.width,normalized.height).data;
            const ocrMask=!!pixels&&pixels.some((v,i)=>i%4===0&&v===0)&&pixels.every((v,i)=>i%4!==3||v===255);
            const custom=drawer().querySelector('[data-drawer-custom-color]');
            custom.value=dark?'#000000':'#ffffff';
            custom.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,100));
            const customContrast=colors.drawingContrast(custom.value,dark)>=4.5;
            document.documentElement.classList.toggle('dark',!dark);await new Promise(r=>setTimeout(r,150));
            const liveTheme=getComputedStyle(canvas).backgroundColor===(dark?'rgb(255, 255, 255)':'rgb(0, 0, 0)')&&inkPixel().slice(0,3).every(v=>v===(dark?0:255))&&alphaCount()===inkBefore;
            document.documentElement.classList.toggle('dark',dark);await new Promise(r=>setTimeout(r,150));
            set(size,'30');await new Promise(r=>setTimeout(r,100));
            tool('eraser').click();await new Promise(r=>setTimeout(r,100));
            trace();await new Promise(r=>setTimeout(r,100));
            const erasedTheme=inkBefore>0&&alphaCount()===0&&confirm().disabled&&getComputedStyle(canvas).backgroundColor===canvasColor;
            action('Undo').click();await new Promise(r=>setTimeout(r,100));
            const undoErase=alphaCount()===inkBefore&&!confirm().disabled;
            background('transparent').click();await new Promise(r=>setTimeout(r,100));
            const transparentPreview=await previewPixel()==='0,0,0,0'&&alphaCount()===inkBefore;
            action('Redo').click();await new Promise(r=>setTimeout(r,100));
            const redoErase=alphaCount()===0&&confirm().disabled;
            tool('brush').click();set(size,'5');await new Promise(r=>setTimeout(r,100));
            trace();await new Promise(r=>setTimeout(r,100));
            const brushRestored=alphaCount()>0&&!confirm().disabled;
            set(size,'30');tool('eraser').click();await new Promise(r=>setTimeout(r,100));
            trace();await new Promise(r=>setTimeout(r,100));
            const erasedTransparent=alphaCount()===0&&confirm().disabled&&getComputedStyle(canvas).backgroundColor==='rgba(0, 0, 0, 0)';
            trace();await new Promise(r=>setTimeout(r,100));
            const blankUnchanged=alphaCount()===0&&confirm().disabled;
            background('theme').click();tool('brush').click();set(size,'5');await new Promise(r=>setTimeout(r,100));
            const pen=(type,xx,yy,id=7,primary=true)=>canvas.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType:'pen',isPrimary:primary,button:0,buttons:type==='pointerup'||type==='pointercancel'?0:1,clientX:xx,clientY:yy}));
            pen('pointerdown',x,y);
            pen('pointermove',x+20,y+20);
            const penInk=alphaCount();
            pen('pointerdown',x+70,y+10,8,false);
            pen('pointermove',x+70,y+50,8,false);
            const secondIgnored=alphaCount()===penInk;
            pen('pointercancel',x+20,y+20);
            pen('pointermove',x+70,y+70);
            await new Promise(r=>setTimeout(r,100));
            const cancelClean=penInk>0&&alphaCount()===penInk&&!confirm().disabled;
            const touchAction=getComputedStyle(canvas).touchAction==='none';
            const latin=await import('/src/components/common/composables/word-drawing/manager-handle/latinRecognition.ts');
            const selectOption=async(selector,label)=>{
              const btn=drawer().querySelector(selector+' button');
              btn.scrollIntoView({block:'center'});btn.click();
              await wait(()=>[...document.querySelectorAll('[role="option"]')].some(b=>b.textContent.trim()===label));
              [...document.querySelectorAll('[role="option"]')].find(b=>b.textContent.trim()===label)?.click();
              await new Promise(r=>setTimeout(r,200));
            };
            await selectOption('[data-drawer-language]','English');
            action('Clear Canvas').click();await new Promise(r=>setTimeout(r,100));
            const wStroke=[[0,0],[24,65],[48,4],[72,64],[96,0]];
            const drawLetter=paths=>{
              const r=canvas.getBoundingClientRect(), scale=Math.min(r.width/160,r.height/100);
              for(const path of paths){
                const point=(p,type)=>canvas.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:9,pointerType:'touch',isPrimary:true,button:0,buttons:type==='pointerup'?0:1,clientX:r.left+15+p[0]*scale,clientY:r.top+12+p[1]*scale}));
                point(path[0],'pointerdown');for(const p of path.slice(1))point(p,'pointermove');point(path[path.length-1],'pointerup');
              }
            };
            drawLetter([wStroke]);await new Promise(r=>setTimeout(r,100));
            drawer().querySelector('[data-drawer-recognize]').click();
            const englishW=await wait(()=>field().value==='w');
            const upper=[...drawer().querySelectorAll('[data-drawer-candidates] button')].find(b=>b.textContent.trim()==='W');
            upper?.click();await new Promise(r=>setTimeout(r,100));
            const upperW=field().value==='W';
            const separateVs=!latin.continuousW([[[0,0],[20,60],[40,0]],[[48,0],[68,60],[88,0]]]);
            const reversedW=latin.continuousW([[...wStroke].reverse()]);
            await selectOption('[data-drawer-recognition-unit]','Single character');
            action('Clear Canvas').click();await new Promise(r=>setTimeout(r,100));
            drawLetter([[[0,65],[24,0],[48,65]],[[10,39],[38,39]]]);
            await new Promise(r=>setTimeout(r,150));
            drawer().querySelector('[data-drawer-recognize]').click();
            const letterA=await wait(()=>field().value==='A');
            const letterADebug={value:field().value,options:latin.latinCandidates([[[0,65],[24,0],[48,65]],[[10,39],[38,39]]]),ui:[...drawer().querySelectorAll('[data-drawer-candidates] button')].map(b=>b.textContent.trim())};
            const alphabetSamples=[['V',[[[0,0],[25,65],[50,0]]]],['M',[[[0,65],[0,0],[30,42],[60,0],[60,65]]]],['B',[[[0,65],[0,0],[35,0],[50,16],[28,33],[0,33],[35,33],[52,49],[35,65],[0,65]]]]];
            const alphabetMatches=alphabetSamples.every(([letter,paths])=>latin.latinCandidates(paths).slice(0,3).some(c=>c.hanzi===letter));
            await selectOption('[data-drawer-recognition-unit]','Automatic');
            await selectOption('[data-drawer-language]','\u4e2d\u6587 (\u7b80\u4f53)');
            // Clear the initial test stroke; replay a two-character handwriting sample.
            [...drawer().querySelectorAll('button')].find(b=>b.textContent.trim()==='Clear Canvas')?.click();
            await new Promise(r=>setTimeout(r,100));
            const sample=[
              [[.12,.30],[.12,.49]],[[.12,.30],[.37,.30],[.37,.49]],[[.12,.49],[.37,.49]],[[.245,.17],[.245,.72]],
              [[.70,.20],[.73,.27]],[[.54,.32],[.89,.32]],[[.79,.32],[.76,.45],[.68,.54],[.55,.68]],[[.59,.32],[.65,.46],[.75,.56],[.90,.68]]
            ];
            for(const stroke of sample){
              const point=(p,type)=>canvas.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:2,pointerType:'touch',isPrimary:true,button:0,buttons:type==='pointerup'?0:1,clientX:rect.left+p[0]*Math.min(rect.width,rect.height*1.7),clientY:rect.top+p[1]*Math.min(rect.height,rect.width/1.7)}));
              point(stroke[0],'pointerdown');for(const p of stroke.slice(1))point(p,'pointermove');point(stroke[stroke.length-1],'pointerup');
            }
            const autoEnabled=await wait(()=>!confirm()?.disabled&&field().value==='');
            confirm().click();
            const candidates=await wait(()=>drawer()?.querySelector('[data-hanzi-candidates]'));
            const groups=[...drawer().querySelectorAll('[data-hanzi-candidates]>div')];
            const candidateDebug=groups.map(g=>[...g.querySelectorAll("button")].map(b=>b.textContent.trim().codePointAt(0).toString(16)));
            const hasChinese=groups.length===2&&groups[0].innerText.includes('\u4e2d')&&groups[1].innerText.includes('\u6587');
            const first=groups[0]&&[...groups[0].querySelectorAll('button')].find(b=>b.textContent.trim()==='\u4e2d');
            const second=groups[1]&&[...groups[1].querySelectorAll('button')].find(b=>b.textContent.trim()==='\u6587');
            first?.click();second?.click();
            const recognized=field().value==='\u4e2d\u6587';
            if(!recognized)set(field(),'\u4e2d\u6587');
            const image=canvas.toDataURL();
            drawer().querySelector('[data-drawer-mode="keyboard"]').click();await new Promise(r=>setTimeout(r,100));
            drawer().querySelector('[data-drawer-mode="draw"]').click();await new Promise(r=>setTimeout(r,100));
            const preserved=canvas.toDataURL()===image&&field().value==='\u4e2d\u6587';
            confirm().click();const applied=await wait(()=>!drawer()&&word().value==='\u4e2d\u6587');
            await new Promise(r=>setTimeout(r,350)); const reopened=await open();
            if(!reopened)return {ready,opened,initiallyDisabled,enabled,staleCleared,preserved,applied,reopened};
            drawer().querySelector('[data-drawer-mode="keyboard"]').click();await new Promise(r=>setTimeout(r,150));
            set(field(),'\u5b66\u4e60');await new Promise(r=>setTimeout(r,250));
            confirm().click();
            const keyboard=await wait(()=>!drawer()&&word().value==='\u5b66\u4e60');
            return {ready,opened,initiallyDisabled,enabled,staleCleared,preserved,applied,reopened,keyboard,englishW,upperW,separateVs,reversedW,letterA,alphabetMatches,...(!letterA?{letterADebug}:{}),secondIgnored,cancelClean,touchAction,themePreview,defaultInkCorrect,paletteContrast,ocrMask,customContrast,liveTheme,erasedTheme,undoErase,transparentPreview,redoErase,brushRestored,erasedTransparent,blankUnchanged,autoEnabled,candidates,hasChinese,recognized,...(!hasChinese?{candidateDebug}:{}),canvasSized:canvas.width>100&&canvas.height>100};
          })()`,45000)
          // Browser-dispatched touch events exercise native pointer capture, not only synthetic DOM handlers.
          const touchRect=await evaluate(`(async()=>{
            const form=document.querySelector('form[id^="vocabulary-form-"]');
            form?.querySelector('button[title="Open Word Drawing"]')?.click();
            await new Promise(r=>setTimeout(r,450));
            const canvas=document.querySelector('[data-word-drawer] canvas');
            if(!canvas)return null;
            canvas.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,150));
            const r=canvas.getBoundingClientRect();
            const x=Math.round(r.left+r.width*.4),y=Math.round(r.top+r.height*.4);
            window.__drawerTouchCheck={capture:false,touch:false};
            canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')window.__drawerTouchCheck.touch=true});
            canvas.addEventListener('gotpointercapture',()=>{window.__drawerTouchCheck.capture=true});
            return {x,y,scrollY:scrollY};
          })()`);
          if(touchRect){
            await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
            try{
              const {x,y}=touchRect;
              await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:0}]});
              await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+25,y:y+25,id:0}]});
              await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
              await pause(180);
              const touch=await evaluate(`(()=>{
                const canvas=document.querySelector('[data-word-drawer] canvas');
                const button=document.querySelector('[data-drawer-confirm]');
                const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
                let ink=false;for(let i=3;i<data.length;i+=4)if(data[i]>8){ink=true;break}
                return {nativeTouch:window.__drawerTouchCheck.touch&&ink&&!button.disabled,nativeCapture:window.__drawerTouchCheck.capture,scrollStable:scrollY===${touchRect.scrollY}};
              })()`);
              Object.assign(check,touch);
            }finally{await send('Emulation.setTouchEmulationEnabled',{enabled:false});}
          }else Object.assign(check,{nativeTouch:false,nativeCapture:false,scrollStable:false});
          if(touchRect){
            const pad=await evaluate(`(async()=>{
              const d=document.querySelector('[data-word-drawer]');
              [...d.querySelectorAll('button')].find(b=>b.textContent.trim()==='Clear Canvas')?.click();
              d.querySelector('[data-drawer-touchpad]').click();
              await new Promise(r=>setTimeout(r,150));
              const c=d.querySelector('canvas');c.scrollIntoView({block:'center'});
              await new Promise(r=>setTimeout(r,150));
              const r=c.getBoundingClientRect();
              window.__padInk=()=>{const p=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<p.length;i+=4)if(p[i]>8)n++;return n};
              return {x:Math.round(r.left+r.width*.35),y:Math.round(r.top+r.height*.35)};
            })()`);
            const move=(x,y)=>send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'none',buttons:0});
            const space=async()=>{await send('Input.dispatchKeyEvent',{type:'keyDown',code:'Space',key:' ',windowsVirtualKeyCode:32});await send('Input.dispatchKeyEvent',{type:'keyUp',code:'Space',key:' ',windowsVirtualKeyCode:32});};
            await move(pad.x,pad.y);
            await move(pad.x+5,pad.y+5);
            const paused=await evaluate('window.__padInk()===0');
            await space();
            await move(pad.x+8,pad.y+8);
            await move(pad.x+35,pad.y+30);
            await space();
            await pause(100);
            const count=await evaluate('window.__padInk()');
            const padDrawn=count>0&&await evaluate("!document.querySelector('[data-drawer-confirm]').disabled");
            await move(pad.x+45,pad.y+45);
            const padPaused=await evaluate('window.__padInk()==='+count);
            await space();
            await move(pad.x+50,pad.y+10);
            await move(pad.x+70,pad.y+30);
            await space();
            const twoStrokes=await evaluate('window.__padInk()>'+count);
            await evaluate("document.querySelector('[data-drawer-touchpad]').click()");
            await move(pad.x+20,pad.y+60);
            const padOff=await evaluate("document.querySelector('[data-drawer-touchpad]').getAttribute('aria-pressed')==='false'");
            Object.assign(check,{padInitiallyPaused:paused,padDrawn,padPaused,twoStrokes,padOff});
          }
          const themeAndIpa=await evaluate(`(async()=>{
            const wait=async f=>{for(let i=0;i<60;i++){if(f())return true;await new Promise(r=>setTimeout(r,100))}return false};
            const dark=document.documentElement.classList.contains('dark');
            const expected=dark?'rgb(0, 0, 0)':'rgb(255, 255, 255)';
            const drawer=document.querySelector('[data-word-drawer]');
            const drawerTheme=getComputedStyle(drawer.querySelector('[data-learning-modal-shell]')).backgroundColor===expected;
            const toolbar=drawer.querySelector('[data-drawer-toolbar]');
            const canvas=drawer.querySelector('canvas');
            const toolsAbove=toolbar.getBoundingClientRect().bottom<=canvas.getBoundingClientRect().top+1;
            const drawerFit=drawer.querySelector('[data-learning-modal-shell]').scrollWidth<=drawer.querySelector('[data-learning-modal-shell]').clientWidth+1;
            drawer.querySelector('[data-drawer-mode="keyboard"]').click();
            await new Promise(r=>setTimeout(r,200));
            const keyboard=drawer.querySelector('.keyboard-container');
            const keyboardFit=keyboard&&keyboard.scrollWidth<=keyboard.clientWidth+1;
            [...drawer.querySelectorAll('button')].find(b=>b.textContent.trim()==='Cancel')?.click();
            await wait(()=>!document.querySelector('[data-word-drawer]'));
            const form=document.querySelector('form[id^="vocabulary-form-"]');
            form.querySelector('button[title="Open IPA Pronunciation Builder"]').click();
            const ipa=()=>document.querySelector('[data-ipa-modal]');
            const opened=await wait(()=>ipa()?.querySelector('[data-ipa-symbol]'));
            if(!opened)return {drawerTheme,toolsAbove,drawerFit,keyboardFit,ipaOpened:false};
            const shell=ipa().querySelector('[data-learning-modal-shell]');
            const ipaTheme=getComputedStyle(shell).backgroundColor===expected;
            const fit=shell.scrollWidth<=shell.clientWidth+1;
            const input=ipa().querySelector('[data-ipa-input]');
            const scroll=ipa().querySelector('[data-ipa-scroll]');
            ipa().querySelector('[data-ipa-clear]').click();
            const symbols=[...ipa().querySelectorAll('[data-ipa-symbol]')];
            const first=symbols[0].textContent.trim();
            symbols[0].click();symbols[1].click();await new Promise(r=>setTimeout(r,100));
            ipa().querySelector('[data-ipa-backspace]').click();await new Promise(r=>setTimeout(r,100));
            const insert=input.value===first;
            const top=input.getBoundingClientRect().top;
            scroll.scrollTop=scroll.scrollHeight;await new Promise(r=>setTimeout(r,100));
            const fixedInput=input.getBoundingClientRect().top===top;
            input.value='/test/';input.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,100));
            ipa().querySelector('[data-ipa-confirm]').click();
            const applied=await wait(()=>!ipa()&&form.querySelectorAll('input[required]')[1].value==='/test/');
            return {drawerTheme,toolsAbove,drawerFit,keyboardFit,ipaOpened:opened,ipaTheme,ipaFit:fit,ipaInsert:insert,ipaFixed:fixedInput,ipaApplied:applied};
          })()`,30000);
          Object.assign(check,themeAndIpa);
          scenarioResults.push({theme,width,route,scenario:'word-drawer-flow',...check,activated:Object.values(check).every(v=>v===true),visiblePanel:check.opened===true});
          continue;
        }
        if (layoutAudit && route === '/vocabulary') {
          const result=await evaluate(`(async () => {
            let el;
            for(let i=0;i<70;i++){el=document.querySelector('[data-vocabulary-layout-toggle]');if(el)break;await new Promise(r=>setTimeout(r,100));}
            const expected=innerWidth>=768;
            const visible=!!el&&getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().height>0;
            const buttons=el?.querySelectorAll('button').length===2;
            return {expected,visible,buttons,activated:!!el&&visible===expected&&buttons,visiblePanel:!!el&&visible===expected};
          })()`)
          scenarioResults.push({theme,width,route,scenario:'vocabulary-layout-responsive',...result})
          continue
        }
        if (noteAudit && route === '/vocabulary') {
          const check=await evaluate(`(async()=>{
            const wait=async f=>{for(let i=0;i<80;i++){if(f())return true;await new Promise(r=>setTimeout(r,100))}return false};
            const trigger=()=>document.querySelector('[data-vocabulary-note-trigger]');
            const modal=()=>document.querySelector('[data-vocabulary-note-modal]');
            const save=()=>document.querySelector('[data-vocabulary-note-save]');
            const ready=await wait(()=>trigger());
            if(!ready)return {ready:false};
            trigger().click();
            const opened=await wait(()=>modal());
            if(!opened)return {ready,opened};
            const gradient=getComputedStyle(save()).backgroundImage.includes('gradient')&&save().classList.contains('from-primary-500')&&save().classList.contains('to-secondary-500');
            const fit=modal().scrollWidth<=innerWidth+1&&save().getBoundingClientRect().right<=innerWidth+1;
            const area=modal().querySelector('textarea');
            area.value='423432';area.dispatchEvent(new Event('input',{bubbles:true}));
            save().click();
            const saved=await wait(()=>!modal()&&document.body.innerText.includes('Note saved successfully'));
            trigger()?.click();
            const reopened=await wait(()=>modal()?.querySelector('textarea')?.value==='423432');
            if(reopened){const a=modal().querySelector('textarea');a.value='';a.dispatchEvent(new Event('input',{bubbles:true}));save().click();}
            const cleared=await wait(()=>!modal());
            trigger()?.click();
            const empty=await wait(()=>modal()?.querySelector('textarea')?.value==='');
            return {ready,opened,gradient,fit,saved,reopened,cleared,empty};
          })()`,40000)
          scenarioResults.push({theme,width,route,scenario:'vocabulary-note',activated:Object.values(check).every(v=>v===true),visiblePanel:check.fit===true,...check});
          continue
        }
        if (posAudit && route === '/vocabulary') {
          posWrites.length=0;
          const check=await evaluate(`(async()=>{
            const wait=async f=>{for(let i=0;i<80;i++){if(f())return true;await new Promise(r=>setTimeout(r,100))}return false};
            const modal=()=>document.querySelector('form[id^="vocabulary-form-"]');
            const save=()=>document.querySelector('[data-vocabulary-save]');
            const ready=await wait(()=>document.querySelector('button.add-button')&&document.querySelector('[data-part-of-speech]'));
            if(!ready)return {ready:false};
            const labels=[...document.querySelectorAll('[data-part-of-speech]')].map(x=>x.textContent.trim());
            document.querySelector('button.add-button').click();
            const opened=await wait(()=>modal());
            if(!opened)return {ready,opened};
            const inputs=()=>[...modal().querySelectorAll('input[required]')];
            const set=(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));};
            set(inputs()[0],'architecture'); set(inputs()[1],'/test/'); set(inputs()[2],'building design');
            const blocked=await wait(()=>save()?.disabled&&document.querySelector('[data-vocabulary-duplicate-notice]')?.textContent.includes('already exist'));
            const select=()=>document.querySelector('[data-vocabulary-pos] button[aria-haspopup="listbox"]');
            select()?.scrollIntoView({block:'center'}); await new Promise(r=>setTimeout(r,250)); select()?.click();
            const options=await wait(()=>document.querySelectorAll('[role="option"]').length>=15);
            const verb=[...document.querySelectorAll('[role="option"]')].find(o=>o.textContent.trim()==='Verb');
            verb?.click();
            const allowed=await wait(()=>!save()?.disabled&&document.querySelector('[data-vocabulary-duplicate-notice]')?.textContent.includes('same spelling')||!save()?.disabled&&document.querySelector('[data-vocabulary-duplicate-notice]')?.textContent.includes('existing entries'));
            const fit=modal().scrollWidth<=modal().clientWidth+1;
            set(inputs()[0],'audit-new-verb'); set(inputs()[2],'test verb');
            await wait(()=>!document.querySelector('[data-vocabulary-duplicate-notice]'));
            save()?.click();
            const saved=await wait(()=>!modal()&&[...document.querySelectorAll('[data-part-of-speech]')].some(e=>e.textContent.trim()==='Verb'));
            const toggle=document.querySelector('.filters-toggle');
            if(toggle?.getAttribute('aria-expanded')!=='true')toggle?.click();
            const filter=()=>document.querySelector('[data-vocabulary-pos-filter] button[aria-haspopup="listbox"]');
            await wait(()=>filter());filter()?.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,250));filter()?.click();
            await wait(()=>document.querySelectorAll('[role="option"]').length>=15);
            [...document.querySelectorAll('[role="option"]')].find(o=>o.textContent.trim()==='Verb')?.click();
            const filtered=await wait(()=>[...document.querySelectorAll('[data-part-of-speech]')].length===1&&document.querySelector('[data-part-of-speech]')?.textContent.trim()==='Verb');
            document.querySelector('[data-vocabulary-clear-filters]')?.click();
            return {ready,labels:labels.includes('Noun')&&labels.includes('Adjective'),opened,blocked,options,allowed:!!allowed,fit,saved,filtered};
          })()`,45000)
          scenarioResults.push({theme,width,route,scenario:'vocabulary-pos-duplicate',activated:Object.values(check).every(v=>v===true),visiblePanel:check.fit===true,...check})
          continue
        }
        if (route === '/vocabulary') {
          const filterTest = await evaluate(`(async () => {
            const wait=async fn=>{for(let i=0;i<70;i++){if(fn())return true;await new Promise(r=>setTimeout(r,100))}return false};
            await wait(()=>document.querySelector('.filters-toggle'));
            const toggle = document.querySelector('.filters-toggle');
            if(!toggle)return {ready:false};
            if(toggle.getAttribute('aria-expanded')!=='true')toggle.click();
            const cat=()=>document.querySelector('[data-vocabulary-category-filter] button[aria-haspopup="listbox"]');
            const tag=()=>document.querySelector('[data-vocabulary-tag-filter] button[aria-haspopup="listbox"]');
            const ready=await wait(()=>cat()&&tag());
            const delay=()=>new Promise(r=>setTimeout(r,350));
            const list=()=>document.querySelector('[role="listbox"]');
            const options=()=>[...(list()?.querySelectorAll('[role="option"]')||[])];
            const panel=()=>list()?.parentElement;
            const fit=()=>{const r=panel()?.getBoundingClientRect();return !!r&&r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1&&r.height<=341&&list().scrollHeight>=list().clientHeight};
            const setSearch=value=>{const field=panel()?.querySelector('input[type="search"]');if(field){field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));}};
            await delay();
            const initialHeight=document.querySelector('.filters-content').getBoundingClientRect().height;
            cat()?.scrollIntoView({block:'center'}); await delay(); cat()?.click();
            const manyCats=await wait(()=>options().length===150);
            const catFit=fit()&&list().scrollHeight>list().clientHeight;
            const dark=document.documentElement.classList.contains('dark');
            const scrollbarCheck=(el,expectedSize)=>{
              const thumb=getComputedStyle(el,'::-webkit-scrollbar-thumb');
              const track=getComputedStyle(el,'::-webkit-scrollbar-track');
              return thumb.backgroundImage.includes('rgb(102, 126, 234)') && thumb.backgroundImage.includes('rgb(168, 85, 247)') &&
                track.backgroundColor===(dark?'rgba(255, 255, 255, 0.05)':'rgb(243, 244, 246)') &&
                getComputedStyle(el,'::-webkit-scrollbar').width===expectedSize;
            };
            const dropdownTheme=scrollbarCheck(list(),'8px');
            const probe=document.createElement('div');
            probe.style.cssText='position:fixed;top:0;left:0;width:100px;height:80px;overflow:auto;z-index:-1';
            const child=document.createElement('div');
            child.style.cssText='width:200px;height:200px';
            probe.appendChild(child);document.body.appendChild(probe);
            const globalTheme=scrollbarCheck(probe,'8px');
            const rootTheme=scrollbarCheck(document.documentElement,'10px');

            probe.className='scrollbar-thin';
            const thinTheme=scrollbarCheck(probe,'6px');
            probe.className='scrollbar-hide';
            const hiddenPreserved=getComputedStyle(probe).scrollbarWidth==='none' && getComputedStyle(probe,'::-webkit-scrollbar').display==='none';
            probe.remove();
            setSearch('do an');
            const accent=await wait(()=>options().length===1&&options()[0].textContent.includes('X'.repeat(20)));
            options()[0]?.click();
            setSearch('Category 001');
            await wait(()=>options().length===1);
            options()[0]?.click();
            setSearch('');
            await wait(()=>options().length===150);
            panel()?.querySelector('[data-select-chosen-only]')?.click();
            const selectedOnly=await wait(()=>options().length===2&&options().every(o=>o.getAttribute('aria-selected')==='true'));
            cat()?.click(); await wait(()=>!list());
            const compact=cat()?.textContent.includes('2 selected')&&document.querySelector('.filters-content').getBoundingClientRect().height<=initialHeight+90;
            tag()?.scrollIntoView({block:'center'}); await delay(); tag()?.click();
            const manyTags=await wait(()=>options().length===200);
            const tagFit=fit()&&list().scrollHeight>list().clientHeight;
            setSearch('LongTag');
            const longName=await wait(()=>options().length===1);
            const longFit=fit()&&options()[0]?.scrollWidth<=options()[0]?.clientWidth+1;
            options()[0]?.click();
            setSearch('nonexistent-tag');
            const noMatch=await wait(()=>options().length===0&&list()?.textContent.includes('No matching items'));
            document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
            const closed=await wait(()=>!list()&&tag()?.getAttribute('aria-expanded')==='false');
            const retained=cat()?.textContent.includes('2 selected')&&tag()?.textContent.includes('LongTag');
            document.querySelector('[data-vocabulary-clear-filters]')?.click();
            const cleared=await wait(()=>!document.querySelector('[data-vocabulary-clear-filters]')&&cat()?.textContent.includes('Choose categories')&&tag()?.textContent.includes('Choose tags'));
            toggle.click();
            return {ready,manyCats,catFit,dropdownTheme,globalTheme,rootTheme,thinTheme,hiddenPreserved,accent,selectedOnly,compact,manyTags,tagFit,longName,longFit,noMatch,closed,retained,cleared};
          })()`,60000)
          scenarioResults.push({theme,width,route,scenario:'vocabulary-searchable-filters',activated:Object.values(filterTest).every(v=>v===true),visiblePanel:filterTest.catFit===true&&filterTest.tagFit===true,...filterTest})
        }
        if (width <= 390 && (route === '/vocabulary' || route === '/srs')) {
          const selector = route === '/vocabulary' ? 'button.add-button' : '[id^="srs-size-trigger-"]'
          let activated = false
          for (let attempt = 0; attempt < 20 && !activated; attempt++) {
            activated = await evaluate(`(() => {const button=document.querySelector(${JSON.stringify(selector)});if(!button)return false;button.click();return true})()`)
            if (!activated) await pause(250)
          }
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
          const result = await evaluate(`(async () => {
            const modal = document.querySelector('div.fixed.inset-0.z-50');
            const buttons = [...(modal?.querySelectorAll('button[id^="form-section-heading-"]') || [])];
            const tick = () => new Promise(resolve => setTimeout(resolve, 60));
            const collapsed = buttons.length === 3 && buttons.every(button => button.getAttribute('aria-expanded') === 'false');
            if (!collapsed) return { collapsed, retained: false, opened: false };
            buttons[0].click(); await tick();
            const field = modal.querySelector('textarea');
            if (!field) return { collapsed, retained: false, opened: false };
            field.value = 'Accordion test example';
            field.dispatchEvent(new Event('input', { bubbles: true }));
            await tick();
            buttons[0].click(); await tick();
            const summary = buttons[0].textContent.includes('Accordion test example');
            buttons[0].click(); await tick();
            const retained = modal.querySelector('textarea')?.value === 'Accordion test example';
            buttons[0].click(); await tick();
            buttons[1].click(); await tick();
            const classification = modal.querySelectorAll('button[aria-haspopup="listbox"]').length === 3;
            buttons[1].click(); await tick();
            buttons[2].click(); await tick();
            const media = !!modal.querySelector('input[type="file"]');
            buttons[2].click(); await tick();
            return { collapsed, retained: retained && summary, opened: classification && media };
          })()`)
          scenarioResults.push({theme,width,route,scenario:'vocabulary-optional-sections',activated:result.collapsed && result.retained,visiblePanel:result.opened,...result})
        }
        if (width <= 390 && route === '/vocabulary') {
          // Revisit the page to close the creation modal before testing selection flows.
          await send('Page.navigate',{url:base+route},30000)
          await pause(1800)
          for(let i=0;i<20;i++){if(await evaluate("Boolean(document.querySelector('button[title=Select]'))"))break;await pause(250)}
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
          await send('Page.navigate',{url:base+route},30000)
          await pause(1800)
          for(let i=0;i<20;i++){if(await evaluate("Boolean(document.querySelector('button.min-h-9.max-w-full'))"))break;await pause(250)}
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
        if (route.startsWith('/categories/audit-')) {
          const detail = await evaluate(`(async () => {
            const wait=async fn=>{for(let i=0;i<80;i++){if(fn())return true;await new Promise(r=>setTimeout(r,100))}return false};
            const hero=()=>document.querySelector('[data-category-detail-hero]');
            const icon=()=>document.querySelector('[data-category-detail-icon]');
            const custom=location.pathname.endsWith('audit-custom'); const empty=custom||location.pathname.endsWith('audit-empty');
            const ready=await wait(()=>hero()&&icon()&&document.querySelector('[data-category-detail-count]'));
            if(!ready)return {ready:false};
            const content=await wait(()=>empty?document.querySelector('[data-category-detail-empty]'):document.querySelectorAll('[title="View word details"]').length===2);
            const r=icon().getBoundingClientRect();
            const large=r.width>=79&&r.height>=79&&icon().querySelector('svg,img')?.getBoundingClientRect().width>=47;
            const contrast=custom?await wait(()=>icon().querySelector('img')?.naturalWidth===512):getComputedStyle(icon()).color===(empty?'rgb(255, 255, 255)':'rgb(0, 0, 0)');
            const count=document.querySelector('[data-category-detail-count]').textContent.trim().startsWith(empty?'0':'2');
            const back=!!document.querySelector('header a[href="/categories"]');
            const fit=hero().scrollWidth<=hero().clientWidth+1&&hero().getBoundingClientRect().right<=innerWidth+1;
            const populated=empty?!!document.querySelector('[data-category-detail-empty] a[href="/vocabulary"]'):document.querySelectorAll('.category-icon').length===3;
            return {ready,content,large,contrast,count,back,fit,populated};
          })()`,20000)
          scenarioResults.push({theme,width,route,scenario:'category-detail-layout',activated:Object.values(detail).every(v=>v===true),visiblePanel:detail.fit===true,...detail})
        }
        if (route === '/categories') {
          const visual = await evaluate(`(async () => {
            const wait=async fn=>{for(let i=0;i<60;i++){if(fn())return true;await new Promise(r=>setTimeout(r,100))}return false};
            const cards=()=>[...document.querySelectorAll('.category-card')];
            const ready=await wait(()=>cards().length===8); if(!ready)return {ready:false};
            const icons=()=>cards().map(c=>c.querySelector('[data-category-card-icon]'));
            const largeIcons=icons().every(el=>{const r=el?.getBoundingClientRect(); const child=el?.querySelector('svg,img')?.getBoundingClientRect();return r?.width>=75&&r?.height>=75&&child?.width>=45&&child?.height>=45});
            const foreground=el=>getComputedStyle(el).color;
            const brightContrast=foreground(icons()[1])==='rgb(0, 0, 0)';
            const darkContrast=foreground(icons()[2])==='rgb(255, 255, 255)';
            const image=await wait(()=>{const el=icons()[3]?.querySelector('img');return el?.complete&&el?.naturalWidth===512});
            const fallback=!!icons()[4]?.querySelector('svg')&&getComputedStyle(icons()[4]).backgroundColor==='rgb(102, 126, 234)';
            const fit=cards().every(c=>{const r=c.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&c.scrollWidth<=c.clientWidth+1&&c.querySelector('a[href*="/categories/"]')});
            const aligned=cards().every(c=>cards().filter(o=>Math.abs(o.getBoundingClientRect().top-c.getBoundingClientRect().top)<2).every(o=>Math.abs(o.getBoundingClientRect().height-c.getBoundingClientRect().height)<2));
            const visibleActions=cards().every(c=>getComputedStyle(c.querySelector('[data-category-card-actions]')).opacity==='1');
            return {ready,largeIcons,brightContrast,darkContrast,image,fallback,fit,aligned,visibleActions};
          })()`,30000)
          scenarioResults.push({theme,width,route,scenario:'category-card-visual',activated:Object.values(visual).every(v=>v===true),visiblePanel:visual.fit===true,...visual})
          if (process.argv.includes('--category-card-only')) continue
        }
        if (route === '/categories') {
          const actions = await evaluate(`(async () => {
            const wait = async (condition) => {for(let i=0;i<60;i++){if(condition())return true;await new Promise(r=>setTimeout(r,100))}return false}
            const cards = () => [...document.querySelectorAll('.category-card')];
            const initial = await wait(()=>cards().length===8 && document.querySelector('button[aria-label="Next page"]'));
            document.querySelector('button[aria-label="Next page"]')?.click();
            const next = await wait(()=>cards().length===8 && cards()[0]?.querySelector('h3')?.textContent.trim()==='Topic 09');
            const toggle = document.querySelector('[data-category-search-panel] > button');
            const collapsed = toggle?.getAttribute('aria-expanded') === 'false' && !document.querySelector('input[id^="category-search-"]');
            const compactHeight = toggle?.getBoundingClientRect().height || 0;
            toggle?.click();
            const opened = await wait(()=>document.querySelector('input[id^="category-search-"]'));
            const search = document.querySelector('input[id^="category-search-"]');
            if (!search) return {initial,next,search:false};
            search.value = 'Travel'; search.dispatchEvent(new Event('input',{bubbles:true}));
            const searchOk = await wait(()=>cards().length===1 && cards()[0]?.querySelector('h3')?.textContent.trim()==='Travel');
            document.querySelector('button[data-category-advanced]')?.click();
            const advanced = await wait(()=>document.querySelectorAll('button[aria-haspopup="listbox"]').length>=4);
            const contentSelect = document.querySelector('[data-category-content-filter] button[aria-haspopup="listbox"]');
            contentSelect?.scrollIntoView({block:'center'});
            await new Promise(r=>setTimeout(r,250));
            contentSelect?.click();
            await wait(()=>document.getElementById(contentSelect?.getAttribute('aria-controls'))?.querySelector('[role="option"]'));
            const opts = [...(document.getElementById(contentSelect?.getAttribute('aria-controls'))?.querySelectorAll('[role="option"]')||[])];
            opts[1]?.click();
            const empty = await wait(()=>cards().length===0 && !document.querySelector('[aria-busy="true"]'));
            toggle?.click();
            const collapsedAgain = await wait(()=>toggle?.getAttribute('aria-expanded')==='false' && !document.querySelector('input[id^="category-search-"]'));
            const keepsFilters = collapsedAgain && cards().length===0 && toggle.textContent.includes('2');
            toggle?.click();
            const restored = await wait(()=>document.querySelector('input[id^="category-search-"]')?.value==='Travel' && document.querySelector('button[data-category-advanced]')?.getAttribute('aria-expanded')==='true');
            // Reset via the active filter button above the search panel.
            const reset = document.querySelector('[data-category-reset]');
            reset?.click();
            const resetOk = await wait(()=>cards().length===8);
            toggle?.click(); await wait(()=>!document.querySelector('input[id^="category-search-"]')); return {initial,next,search:searchOk,advanced,empty,reset:resetOk,collapsed,compactHeight,opened,collapsedAgain,keepsFilters,restored};
          })()`,25000)
          const filtersLayout = await evaluate(measurement.replace('const viewport = window.innerWidth', 'const viewport = '+width))
          scenarioResults.push({theme,width,route,scenario:'category-pagination-filters',activated:actions.initial && actions.next && actions.search && actions.advanced && actions.empty && actions.reset && actions.collapsed && actions.compactHeight<=50 && actions.opened && actions.collapsedAgain && actions.keepsFilters && actions.restored,visiblePanel:actions.advanced,...actions,...filtersLayout})
        }
        if (route === '/categories') {
          const smart = await evaluate(`(async () => {
            const wait = async condition => {for(let i=0;i<60;i++){if(condition())return true;await new Promise(r=>setTimeout(r,100))}return false}
            const cards = () => [...document.querySelectorAll('.category-card')];
            const toggle = document.querySelector('[data-category-search-panel] > button');
            const compact = toggle?.getAttribute('aria-expanded')==='false' && toggle.textContent.includes('2') && !document.querySelector('[data-category-smart]');
            toggle?.click();
            await wait(()=>document.querySelector('[data-category-advanced]'));
            const advanced = document.querySelector('[data-category-advanced]');
            if(advanced?.getAttribute('aria-expanded')!=='true') advanced?.click();
            const opened = await wait(()=>document.querySelectorAll('[data-category-smart]').length===4 && document.querySelector('[data-category-smart-reminder]'));
            const fit = [...document.querySelectorAll('[data-category-smart]')].every(b=>b.getBoundingClientRect().right<=innerWidth+1 && b.scrollWidth<=b.clientWidth+1);
            const choose = mode => document.querySelector('[data-category-smart="'+mode+'"]')?.click();
            choose('interested');
            const interested = await wait(()=>cards().length===2 && cards()[0]?.querySelector('h3')?.textContent.trim()==='Travel' && document.querySelectorAll('[data-category-smart-reason]').length===2);
            choose('neglected');
            const neglected = await wait(()=>cards().length===2 && cards()[0]?.querySelector('h3')?.textContent.trim()==='Topic 02' && document.querySelectorAll('[data-category-smart-reason]').length===2);
            choose('recommended');
            const recommended = await wait(()=>cards().length===4 && document.querySelectorAll('[data-category-smart-reason]').length===4);
            toggle?.click();
            const retained = await wait(()=>!document.querySelector('[data-category-smart]') && cards().length===4);
            toggle?.click();
            const restored = await wait(()=>document.querySelector('[data-category-smart="recommended"]')?.getAttribute('aria-pressed')==='true');
            document.querySelector('[data-category-reset]')?.click();
            const reset = await wait(()=>cards().length===8 && document.querySelector('[data-category-smart="all"]')?.getAttribute('aria-pressed')==='true' && !document.querySelector('[data-category-smart-reason]'));
            toggle?.click();
            return {compact,opened,fit,interested,neglected,recommended,retained,restored,reset};
          })()`,35000)
          scenarioResults.push({theme,width,route,scenario:'category-smart-filter',activated:Object.values(smart).every(value=>value===true),visiblePanel:smart.opened,...smart})
        }
        if (route === '/categories') {
          const selection = await evaluate(`(async () => {
            const wait = async condition => {for(let i=0;i<60;i++){if(condition())return true;await new Promise(r=>setTimeout(r,100))}return false}
            const cards = () => [...document.querySelectorAll('.category-card')];
            const bar = () => document.querySelector('[data-bulk-action-bar]');
            const count = () => bar()?.querySelector('div.bg-gradient-to-r')?.textContent.trim();
            const checked = () => document.querySelectorAll('[data-category-select][aria-pressed="true"]').length;
            const ready = await wait(()=>cards().length===8 && cards()[0]?.querySelector('h3')?.textContent.trim()==='Travel');
            const mode = () => document.querySelector('[data-category-selection-mode]');
            const defaultHidden = !document.querySelector('[data-category-select]') && mode()?.getAttribute('aria-pressed')==='false' && !!document.querySelector('[data-category-card-actions]');
            mode()?.click();
            const modeOpened = await wait(()=>document.querySelectorAll('[data-category-select]').length===8 && mode()?.getAttribute('aria-pressed')==='true' && !document.querySelector('[data-category-card-actions]'));
            document.querySelector('[data-category-quick-select]')?.click();
            const quickSelect = await wait(()=>count()==='8' && checked()===8);
            mode()?.click();
            const modeClosed = await wait(()=>!bar() && !document.querySelector('[data-category-select]') && !!document.querySelector('[data-category-card-actions]'));
            mode()?.click();
            await wait(()=>document.querySelectorAll('[data-category-select]').length===8);
            cards()[0]?.querySelector('[data-category-select]')?.click();
            const one = await wait(()=>count()==='1' && checked()===1);
            const fit = bar() && bar().getBoundingClientRect().left>=-1 && bar().getBoundingClientRect().right<=innerWidth+1;
            bar()?.querySelector('[data-bulk-select-page]')?.click();
            const all = await wait(()=>count()==='8' && checked()===8);
            document.querySelector('button[aria-label="Next page"]')?.click();
            const retained = await wait(()=>cards()[0]?.querySelector('h3')?.textContent.trim()==='Topic 09' && count()==='8' && checked()===0);
            cards()[0]?.querySelector('[data-category-select]')?.click();
            const acrossPages = await wait(()=>count()==='9' && checked()===1);
            bar()?.querySelector('[data-bulk-select-page]')?.click();
            const both = await wait(()=>count()==='16' && checked()===8);
            bar()?.querySelector('[data-bulk-select-page]')?.click();
            const pageOnly = await wait(()=>count()==='8' && checked()===0);
            document.querySelector('button[aria-label="Previous page"]')?.click();
            const returned = await wait(()=>checked()===8 && count()==='8');
            bar()?.querySelector('[data-category-bulk-pin]')?.click();
            const processed = await wait(()=>!bar() && cards().length===8);
            cards()[0]?.querySelector('[data-category-select]')?.click();
            await wait(()=>count()==='1');
            bar()?.querySelector('[data-bulk-delete]')?.click();
            const confirmation = await wait(()=>[...document.querySelectorAll('body button')].some(b=>b.textContent.trim()==='Delete' && b.closest('[aria-live="assertive"]')));
            const confirmButton = [...document.querySelectorAll('body button')].find(b=>b.textContent.trim()==='Delete' && b.closest('[aria-live="assertive"]'));
            confirmButton?.click();
            const deleted = await wait(()=>!bar() && cards().length===8);
            cards()[0]?.querySelector('[data-category-select]')?.click();
            await wait(()=>count()==='1');
            bar()?.querySelector('[data-bulk-clear]')?.click();
            const cleared = await wait(()=>!bar() && checked()===0 && !document.querySelector('[data-category-select]') && mode()?.getAttribute('aria-pressed')==='false');
            mode()?.click();
            await wait(()=>document.querySelectorAll('[data-category-select]').length===8);
            cards()[0]?.querySelector('[data-category-select]')?.click();
            await wait(()=>count()==='1');
            document.querySelector('[data-category-search-panel] > button')?.click();
            await wait(()=>document.querySelector('input[id^="category-search-"]'));
            const input = document.querySelector('input[id^="category-search-"]');
            if(input){input.value='Travel';input.dispatchEvent(new Event('input',{bubbles:true}))}
            const filterClears = await wait(()=>!bar() && cards().length===1);
            document.querySelector('[data-category-reset]')?.click();
            await wait(()=>cards().length===8);
            document.querySelector('[data-category-search-panel] > button')?.click();
            mode()?.click(); const finalHidden = await wait(()=>!document.querySelector('[data-category-select]')); return {ready,defaultHidden,modeOpened,quickSelect,modeClosed,one,fit,all,retained,acrossPages,both,pageOnly,returned,processed,confirmation,deleted,cleared,filterClears,finalHidden};
          })()`,40000)
          scenarioResults.push({theme,width,route,scenario:'category-bulk-selection',activated:Object.values(selection).every(value=>value===true),visiblePanel:selection.fit===true,...selection})
        }
        if (route === '/tags') {
          const check=await evaluate(`(async()=>{
            const wait=async f=>{for(let i=0;i<80;i++){if(f())return true;await new Promise(r=>setTimeout(r,100))}return false};
            const cards=()=>[...document.querySelectorAll('[data-tag-card]')];
            const modal=()=>document.querySelector('[data-tag-modal]');
            const ready=await wait(()=>cards().length===8);
            if(!ready)return {ready:false};
            const icons=cards().map(c=>c.querySelector('[data-tag-icon]'));
            const contrast=getComputedStyle(icons[0]).color==='rgb(0, 0, 0)'&&getComputedStyle(icons[1]).color==='rgb(255, 255, 255)';
            const large=icons.every(el=>el.getBoundingClientRect().width>=59);
            const fit=cards().every(c=>c.scrollWidth<=c.clientWidth+1&&c.getBoundingClientRect().right<=innerWidth+1);
            const links=cards().every(c=>!!c.querySelector('a[href^="/tags/"]'));
            const actions=cards().every(c=>c.querySelector('[data-tag-edit]').getBoundingClientRect().width>20&&c.querySelector('[data-tag-delete]').getBoundingClientRect().width>20);
            cards()[0].querySelector('[data-tag-edit]').click();
            const opened=await wait(()=>modal());
            if(!opened)return {ready,opened};
            const name=()=>modal()?.querySelector('input[required]');
            const editTitle=modal().querySelector('h2').textContent.trim()==='Edit tag'&&name().value==='Tag 01';
            const set=(el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));};
            set(name(),'Edited audit tag');
            modal().querySelector('[data-tag-color][aria-label="#000000"]').click();
            await wait(()=>modal().querySelector('[data-tag-preview]').textContent.includes('Edited audit tag'));
            const preview=modal().querySelector('[data-tag-preview]').textContent.includes('Edited audit tag')&&modal().querySelector('input[type="color"]').value==='#000000';
            const bounds=modal().getBoundingClientRect();
            const modalFit=bounds.width<=innerWidth&&bounds.bottom<=innerHeight+1&&modal().scrollWidth<=modal().clientWidth+1;
            modal().querySelector('button[type="submit"]').click();
            const edited=await wait(()=>!modal()&&cards().some(c=>c.textContent.includes('Edited audit tag')));
            const add=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Add New Tag');
            add?.click();
            const create=await wait(()=>modal());
            if(!create)return {ready,opened,editTitle,preview,modalFit,edited,create};
            const blankDisabled=modal().querySelector('button[type="submit"]').disabled;
            const createTitle=modal().querySelector('h2').textContent.trim()==='Create tag';
            set(name(),'New audit tag');
            await wait(()=>!modal().querySelector('button[type="submit"]').disabled);
            modal().querySelector('button[type="submit"]').click();
            const created=await wait(()=>!modal()&&cards().some(c=>c.textContent.includes('New audit tag')));
            return {ready,contrast,large,fit,links,actions,opened,editTitle,preview,modalFit,edited,create,blankDisabled,createTitle,created};
          })()`,30000)
          scenarioResults.push({theme,width,route,scenario:'tag-card-editor',activated:Object.values(check).every(v=>v===true),visiblePanel:check.modalFit===true,...check})
        }
        if (width <= 390 && (route === '/categories' || route === '/tags')) {
          let activated = false
          for (let attempt = 0; attempt < 20 && !activated; attempt++) {
            activated = await evaluate(`(() => {const button=document.querySelector('main h1')?.parentElement?.parentElement?.querySelector('button') || document.querySelector('h1')?.parentElement?.parentElement?.querySelector('button');if(!button)return false;button.click();return true})()`)
            if (!activated) await pause(250)
          }
          await pause(500)
          const detail = await evaluate(measurement.replace('const viewport = window.innerWidth', 'const viewport = '+width))
          const visiblePanel = await evaluate(`Boolean(document.querySelector('div.fixed.inset-0.z-50'))`)
          scenarioResults.push({theme,width,route,scenario:'category-tag-modal',activated,visiblePanel,...detail})
          if (width <= 320 && visiblePanel) {
            const snap = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})
            writeFileSync(resolve(screenshotFolder,(route==='/categories'?'category-modal':'tag-modal')+'-'+width+'-'+theme+'.png'),Buffer.from(snap.data,'base64'))
          }
        }
        if (width <= 390 && route === '/categories') {
          const upload = await evaluate(`(async () => {
            const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
            if (!modal) return { preview: false, preset: false, validForm: false };
            const modes = [...modal.querySelectorAll('button[aria-pressed]')];
            modes[1]?.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            const input = modal.querySelector('input[type="file"]');
            if (!input) return { preview: false, preset: false, validForm: false };
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
            const ctx = canvas.getContext('2d'); ctx.fillStyle = 'red'; ctx.fillRect(0, 0, 32, 32);
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const transfer = new DataTransfer(); transfer.items.add(new File([blob], 'test.png', {type:'image/png'}));
            input.files = transfer.files; input.dispatchEvent(new Event('change', {bubbles:true}));
            for(let i=0;i<30 && !modal.querySelector('img[src^="data:image/"]');i++) await new Promise(resolve=>setTimeout(resolve,100));
            const preview = !!modal.querySelector('img[src^="data:image/"]');
            const previewSrc = () => modal.querySelector('img[src^="data:image/"]')?.getAttribute('src') || '';
                        const previous = previewSrc();
            const uploaded = new Image(); uploaded.src = previous; await uploaded.decode();
            const highResolution = uploaded.naturalWidth === 768 && uploaded.naturalHeight === 768 && previous.length <= 120000;
            const processor = await import('/src/utils/categoryIconImage.ts');
            const sample = document.createElement('canvas'); sample.width=1024; sample.height=512;
            const sampleCtx=sample.getContext('2d');
            sampleCtx.fillStyle='#6699cc';sampleCtx.fillRect(100,100,824,312);
            sampleCtx.fillStyle='#345678';sampleCtx.fillRect(400,100,224,312);
            const normalized=await processor.normalizeCategoryIcon(await new Promise(r=>sample.toBlob(r,'image/png')));
            const normalizedImage=new Image();normalizedImage.src=normalized;await normalizedImage.decode();
            const check=document.createElement('canvas');check.width=check.height=768;
            const checkCtx=check.getContext('2d');checkCtx.drawImage(normalizedImage,0,0);
            const alphaPreserved=checkCtx.getImageData(0,0,1,1).data[3]===0&&checkCtx.getImageData(384,384,1,1).data[3]===255;
            const aspectPreserved=checkCtx.getImageData(384,100,1,1).data[3]===0&&checkCtx.getImageData(384,300,1,1).data[3]===255;
            const budget=normalized.length<=120000&&normalizedImage.naturalWidth===768;
            const cachedA=processor.enhanceCategoryIconForDisplay(previous);
            const cachedB=processor.enhanceCategoryIconForDisplay(previous);
                        const enhancedImage=new Image();enhancedImage.src=await cachedA;await enhancedImage.decode();
            const cachePreserved=cachedA===cachedB&&enhancedImage.naturalWidth===512;
            // Measure real visible-scale edge contrast, not merely the encoded pixel count.
            const soft=document.createElement('canvas');soft.width=soft.height=128;
            const sc=soft.getContext('2d');sc.fillStyle='#777777';sc.fillRect(0,0,128,128);
            const gradient=sc.createLinearGradient(54,0,74,0);gradient.addColorStop(0,'#777777');gradient.addColorStop(1,'#aaaaaa');
            sc.fillStyle=gradient;sc.fillRect(54,0,20,128);sc.fillStyle='#aaaaaa';sc.fillRect(74,0,54,128);
            // A softer realistic edge with narrow bars, sampled at the card's display width.
            sc.fillStyle='#999999';sc.fillRect(29,24,6,80);
            const original=soft.toDataURL();
            const improved=new Image();improved.src=await processor.enhanceCategoryIconForDisplay(original);await improved.decode();
            const measure=source=>{const c=document.createElement('canvas');c.width=c.height=76;const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(source,0,0,76,76);const d=x.getImageData(0,0,76,76).data;let edge=0;for(let y=20;y<56;y++)for(let i=12;i<64;i++){const at=(y*76+i)*4;edge+=Math.abs(d[at]-d[at-4]);}return {edge,flat:d[(10*76+5)*4]};};
            const before=measure(soft),after=measure(improved);
            const strongerEdges=after.edge>before.edge*1.12&&Math.abs(after.flat-before.flat)<=1;
            const sourceButtons = [...modal.querySelectorAll('div[role="group"] button[aria-pressed]')];
            sourceButtons[1]?.click();
            await new Promise(resolve => setTimeout(resolve, 60));
            const urlInput = modal.querySelector('input[inputmode="url"]');
            const originalFetch = window.fetch;
            ctx.fillStyle = 'blue'; ctx.fillRect(0, 0, 32, 32);
            const urlBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            window.fetch = async (url, options) => String(url) === 'https://example.invalid/icon.png'
              ? new Response(urlBlob, {headers:{'content-type':'image/png'}})
              : String(url) === 'https://example.invalid/bad.png'
                ? new Response('missing', {status:404})
                : originalFetch(url, options);
            const loadUrl = async value => {
              if (!urlInput) return;
              urlInput.value = value; urlInput.dispatchEvent(new Event('input', {bubbles:true}));
              await new Promise(resolve => setTimeout(resolve, 30));
              urlInput.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true, cancelable:true}));
            };
            await loadUrl('https://example.invalid/icon.png');
            for (let i=0;i<30 && previewSrc()===previous;i++) await new Promise(resolve=>setTimeout(resolve,100));
            const url = !!previewSrc() && previewSrc() !== previous;
            const beforeError = previewSrc();
            await loadUrl('https://example.invalid/bad.png');
            for (let i=0;i<20 && !modal.querySelector('[role="alert"]');i++) await new Promise(resolve=>setTimeout(resolve,80));
            const urlError = !!modal.querySelector('[role="alert"]') && previewSrc() === beforeError;
            window.fetch = originalFetch;
            sourceButtons[2]?.click();
            await new Promise(resolve => setTimeout(resolve, 60));
            const pasteTarget = modal.querySelector('[data-icon-paste]');
            ctx.fillStyle = 'green'; ctx.fillRect(0, 0, 32, 32);
            const clipBlob = await new Promise(resolve => canvas.toBlob(resolve,'image/png'));
            const pasted = new DataTransfer();
            pasted.items.add(new File([clipBlob], 'clipboard.png', {type:'image/png'}));
            const beforePaste = previewSrc();
            pasteTarget?.dispatchEvent(new ClipboardEvent('paste', {clipboardData:pasted, bubbles:true, cancelable:true}));
            for(let i=0;i<30 && previewSrc()===beforePaste;i++) await new Promise(resolve=>setTimeout(resolve,100));
            const clipboard = !!previewSrc() && previewSrc() !== beforePaste;
            const beforeRead = previewSrc();
            ctx.fillStyle = 'orange'; ctx.fillRect(0, 0, 32, 32);
            const readBlob = await new Promise(resolve => canvas.toBlob(resolve,'image/png'));
            Object.defineProperty(navigator.clipboard, 'read', {configurable:true, value:async()=>[{types:['image/png'],getType:async()=>readBlob}]});
            pasteTarget?.click();
            for(let i=0;i<30 && previewSrc()===beforeRead;i++) await new Promise(resolve=>setTimeout(resolve,100));
            const clipboardButton = !!previewSrc() && previewSrc() !== beforeRead;
            delete navigator.clipboard.read;
            const name = modal.querySelector('input[required]');
            name.value = 'Audit category'; name.dispatchEvent(new Event('input', {bubbles:true}));
            await new Promise(resolve=>setTimeout(resolve,60));
            const validForm = !modal.querySelector('button[type="submit"]')?.disabled;
            modes[0].click(); await new Promise(resolve=>setTimeout(resolve,60));
            modal.querySelector('button[aria-label="book"]')?.click();
            await new Promise(resolve=>setTimeout(resolve,60));
            const preset = !modal.querySelector('img[src^="data:image/"]') && modal.querySelector('button[aria-label="book"]')?.getAttribute('aria-pressed') === 'true';
            return {preview, preset, validForm, url, urlError, clipboard, clipboardButton,highResolution,alphaPreserved,aspectPreserved,budget,cachePreserved,strongerEdges};
          })()`)
          scenarioResults.push({theme,width,route,scenario:'category-custom-icon',activated:upload.preview && upload.validForm && upload.url && upload.urlError && upload.clipboard && upload.clipboardButton && upload.highResolution && upload.alphaPreserved && upload.aspectPreserved && upload.budget && upload.cachePreserved && upload.strongerEdges,visiblePanel:upload.preset,...upload})
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
