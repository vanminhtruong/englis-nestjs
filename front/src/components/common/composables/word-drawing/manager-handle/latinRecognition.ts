import type { Stroke, HanziCandidate } from './hanziRecognition'

export type RecognitionUnit = 'auto' | 'character' | 'word'
export const isLatinLanguage = (language: string) => language === 'eng' || language === 'vie'

// Original geometric handwriting prototypes (not a trained neural model).
// Coordinates describe pen paths; | separates strokes.
const prototypes: Record<string,string[]> = {
 A:['0,10 5,0 10,10|2,6 8,6'], B:['0,10 0,0 6,0 9,2 6,5 0,5 7,5 10,7 7,10 0,10'],
 C:['10,1 6,0 2,2 0,5 2,8 6,10 10,9'], D:['0,10 0,0 5,0 9,3 10,6 7,9 0,10'],
 E:['10,0 0,0 0,10 10,10|0,5 8,5'], F:['10,0 0,0 0,10|0,5 8,5'],
 G:['10,1 6,0 2,2 0,5 2,9 7,10 10,8 10,5 6,5'], H:['0,0 0,10|10,0 10,10|0,5 10,5'],
 I:['0,0 8,0|4,0 4,10|0,10 8,10'], J:['10,0 10,7 8,10 3,10 0,7'],
 K:['0,0 0,10|10,0 0,5 10,10'], L:['0,0 0,10 10,10'],
 M:['0,10 0,0 5,6 10,0 10,10'], N:['0,10 0,0 10,10 10,0'],
 O:['5,0 9,2 10,5 9,8 5,10 1,8 0,5 1,2 5,0'], P:['0,10 0,0 6,0 10,2 8,5 0,5'],
 Q:['5,0 9,2 10,5 9,8 5,10 1,8 0,5 1,2 5,0|6,7 11,11'], R:['0,10 0,0 6,0 10,2 8,5 0,5|4,5 10,10'],
 S:['10,1 6,0 2,1 0,3 2,5 8,6 10,8 8,10 3,10 0,9'], T:['0,0 10,0|5,0 5,10'],
 U:['0,0 0,7 2,10 8,10 10,7 10,0'], V:['0,0 5,10 10,0'],
 W:['0,0 3,10 6,0 9,10 12,0','0,0 3,10 6,0|6,0 9,10 12,0'],
 X:['0,0 10,10|10,0 0,10'], Y:['0,0 5,5 10,0|5,5 5,10'], Z:['0,0 10,0 0,10 10,10'],
 a:['8,3 4,2 1,4 1,8 4,10 8,8 8,2 8,10','8,2 2,2 0,4 3,5 8,5 8,10 2,10 0,8 2,5'],
 b:['0,0 0,10 0,5 5,4 9,6 9,8 5,10 0,8'], c:['9,1 5,0 1,2 0,5 2,9 6,10 9,9'],
 d:['9,0 9,10 9,5 5,4 1,6 1,8 5,10 9,8'], e:['0,5 9,5 8,1 4,0 0,3 0,7 4,10 9,9'],
 f:['8,0 5,0 3,2 3,10|0,4 7,4'], g:['8,2 4,1 0,4 0,7 4,9 8,7 8,1 8,12 5,14 1,12'],
 h:['0,0 0,10 0,6 4,4 8,5 9,10'], i:['5,4 5,10|5,0 5,1'], j:['7,4 7,12 4,14 1,12|7,0 7,1'],
 k:['0,0 0,10|8,4 0,7 9,10'], l:['4,0 4,9 6,10'], m:['0,10 0,0 0,3 3,0 6,3 6,10 6,3 9,0 12,3 12,10'],
 n:['0,10 0,0 0,3 5,0 9,3 9,10'], o:['5,0 9,2 10,5 9,8 5,10 1,8 0,5 1,2 5,0'],
 p:['0,14 0,0 0,3 5,0 9,2 9,6 5,8 0,6'], q:['9,14 9,0 9,3 5,0 1,2 1,6 5,8 9,6'],
 r:['0,10 0,0 0,3 4,0 8,1'], s:['9,1 4,0 0,2 2,5 8,6 10,8 6,10 0,9'],
 t:['4,0 4,8 6,10 9,9|0,3 9,3'], u:['0,0 0,7 3,10 7,9 9,6 9,0 9,10'],
 v:['0,0 5,10 10,0'], w:['0,0 3,10 6,1 9,10 12,0','0,0 3,10 6,1|6,1 9,10 12,0'],
 x:['0,0 10,10|10,0 0,10'], y:['0,0 5,8 10,0|5,8 2,14'], z:['0,0 10,0 0,10 10,10'],
}
type Point = [number,number]
function cloud(strokes: Stroke[]): Point[] {
 const all=strokes.flat()
 if(!all.length)return []
 const xs=all.map(p=>p[0]!),ys=all.map(p=>p[1]!)
 const left=Math.min(...xs),top=Math.min(...ys),w=Math.max(...xs)-left,h=Math.max(...ys)-top
 const scale=Math.max(w,h,1)
 const result:Point[]=[]
 for(const stroke of strokes){
   for(let i=1;i<stroke.length;i++){
     const a=stroke[i-1]!,b=stroke[i]!
     const n=Math.max(1,Math.ceil(Math.hypot(b[0]!-a[0]!,b[1]!-a[1]!)/scale*24))
     for(let j=0;j<=n;j++){
       const x=(a[0]!+(b[0]!-a[0]!)*j/n-left-w/2)/scale
       const y=(a[1]!+(b[1]!-a[1]!)*j/n-top-h/2)/scale
       result.push([x,y])
     }
   }
 }
 return result
}
const templates=Object.entries(prototypes).flatMap(([letter,variants])=>variants.map(raw=>{
 const strokes=raw.split('|').map(path=>path.split(' ').map(p=>p.split(',').map(Number)))
 return {letter,points:cloud(strokes),count:strokes.length}
}))
function distance(a:Point[],b:Point[]):number{
 let sum=0
 for(const p of a){
   let best=Infinity
   for(const q of b){const dx=p[0]-q[0],dy=p[1]-q[1];best=Math.min(best,dx*dx+dy*dy)}
   sum+=best
 }
 return sum/Math.max(1,a.length)
}
export function latinCandidates(strokes:Stroke[]):HanziCandidate[]{
 if(!strokes.length||strokes.length>12)return []
 const points=cloud(strokes)
 if(!points.length||points.length>12000)return []
 const sampled=points.length>400?points.filter((_,i)=>i%Math.ceil(points.length/400)===0):points
 const scores=new Map<string,number>()
 for(const t of templates){
   const score=(distance(sampled,t.points)+distance(t.points,sampled))/2+Math.min(3,Math.abs(strokes.length-t.count))*.0005
   scores.set(t.letter,Math.min(scores.get(t.letter)??Infinity,score))
 }
 return [...scores].sort((a,b)=>a[1]-b[1]).slice(0,8).map(([hanzi,score])=>({hanzi,score}))
}
// Only a continuous left-to-right W with two valleys is promoted in auto mode.
// Never replace two separate V strokes (or a text OCR result globally).
export function continuousW(strokes:Stroke[]):boolean{
 if(strokes.length!==1)return false
 const p=strokes[0]!
 if(p.length<5)return false
 const xs=p.map(a=>a[0]!),ys=p.map(a=>a[1]!)
 const w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys)
 if(w<8||h<8||w/h<.55||w/h>2.5)return false
 const direction=p[p.length-1]![0]!>=p[0]![0]!?1:-1
 let reverse=0,travel=0
 for(let i=1;i<p.length;i++){const dx=(p[i]![0]!-p[i-1]![0]!)*direction;travel+=Math.abs(dx);if(dx<0)reverse-=dx}
 if(reverse>travel*.15)return false
 const ordered=direction===1?p:[...p].reverse()
 const x0=Math.min(...xs)
 const bins=Array.from({length:5},()=>[] as number[])
 for(let i=1;i<ordered.length;i++){
   const a=ordered[i-1]!,b=ordered[i]!
   const steps=Math.max(1,Math.ceil(Math.hypot(b[0]!-a[0]!,b[1]!-a[1]!)/Math.max(w,h)*100))
   for(let j=0;j<=steps;j++){
     const x=a[0]!+(b[0]!-a[0]!)*j/steps,y=a[1]!+(b[1]!-a[1]!)*j/steps
     bins[Math.max(0,Math.min(4,Math.round((x-x0)/w*4)))]!.push(y)
   }
 }
 if(bins.some(b=>!b.length))return false
 const mean=bins.map(b=>b.reduce((s,v)=>s+v,0)/b.length)
 return mean[1]!-mean[0]!>h*.3&&mean[1]!-mean[2]!>h*.22&&mean[3]!-mean[2]!>h*.22&&mean[3]!-mean[4]!>h*.3
}
