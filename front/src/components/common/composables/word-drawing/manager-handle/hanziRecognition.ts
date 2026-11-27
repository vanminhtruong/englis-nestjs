export type Stroke = number[][]
export type HanziCandidate = { hanzi: string; score: number }
type StrokeBounds = { strokes: Stroke[]; minX: number; maxX: number; minY: number; maxY: number }

/** Merge intersecting horizontal spans, then read character groups left-to-right.
 * Points keep their original order inside each group. */
export function groupHanziStrokes(strokes: Stroke[]): Stroke[][] {
  const indexed = strokes.map((stroke, index) => ({
    stroke, index, minX: Math.min(...stroke.map(p=>p[0]!)), maxX: Math.max(...stroke.map(p=>p[0]!)),
    minY: Math.min(...stroke.map(p=>p[1]!)), maxY: Math.max(...stroke.map(p=>p[1]!))
  })).filter(s=>s.stroke.length>1).sort((a,b)=>a.minX-b.minX)
  if(!indexed.length)return []
  const totalHeight=Math.max(...indexed.map(s=>s.maxY))-Math.min(...indexed.map(s=>s.minY))
  const gap=Math.max(3,totalHeight*.07)
  const groups: Array<{maxX:number;items:typeof indexed}>=[]
  for(const stroke of indexed) {
    const last=groups[groups.length-1]
    if(last && stroke.minX<=last.maxX+gap) { last.maxX=Math.max(last.maxX,stroke.maxX);last.items.push(stroke) }
    else groups.push({maxX:stroke.maxX,items:[stroke]})
  }
  return groups.map(g=>{
    const items=g.items.sort((a,b)=>a.index-b.index)
    const left=Math.min(...items.map(s=>s.minX)), top=Math.min(...items.map(s=>s.minY))
    const width=Math.max(...items.map(s=>s.maxX))-left, height=Math.max(...items.map(s=>s.maxY))-top
    const scale=220/Math.max(1,width,height)
    return items.map(s=>s.stroke.map(p=>[Math.round((p[0]!-left)*scale+(255-width*scale)/2),Math.round((p[1]!-top)*scale+(255-height*scale)/2)]))
  })
}

export async function recognizeHanziStrokes(strokes: Stroke[]): Promise<HanziCandidate[][]> {
  const groups=groupHanziStrokes(strokes)
  if(!groups.length||groups.length>16)return []
  const url=new URL(import.meta.env.BASE_URL+'vendor/hanzi-lookup/',window.location.origin)
  const worker=new Worker(new URL('worker.js',url))
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await new Promise<HanziCandidate[][]>((resolve,reject)=>{
      const result:HanziCandidate[][]=[]
      timer=setTimeout(()=>reject(new Error('Handwriting recognition timed out')),10000)
      worker.onerror=()=>reject(new Error('Handwriting recognition unavailable'))
      const next=()=>{
        if(result.length===groups.length){resolve(result);return}
        worker.postMessage({strokes:groups[result.length],limit:8})
      }
      worker.onmessage=({data})=>{
        if(data.what==='loaded')next()
        else if(data.what==='lookup'){
          const matches=(Array.isArray(data.matches)?data.matches:[]).filter((m:HanziCandidate)=>typeof m.hanzi==='string')
          if(!matches.length){resolve([]);return}
          result.push(matches);next()
        }
      }
      worker.postMessage({wasm_uri:new URL('hanzi_lookup_bg.wasm',url).href})
    })
  }finally{clearTimeout(timer);worker.terminate()}
}
