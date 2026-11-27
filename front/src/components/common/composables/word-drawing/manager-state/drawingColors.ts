import { colorPalette } from './wordDrawingData'

const channel = (value: number) => {
  const normalized = value / 255
  return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4
}
const luminance = (r: number, g: number, b: number) => .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b)
const hex = (rgb: number[]) => '#' + rgb.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase()
export const drawingBackground = (dark: boolean) => dark ? '#000000' : '#FFFFFF'
export const defaultInk = (dark: boolean) => dark ? '#FFFFFF' : '#000000'

export function drawingContrast(color: string, dark: boolean): number {
  if (!/^#[\da-f]{6}$/i.test(color)) return 0
  const rgb = [1,3,5].map(i=>parseInt(color.slice(i,i+2),16))
  const light = luminance(rgb[0]!,rgb[1]!,rgb[2]!)
  return dark ? (light+.05)/.05 : 1.05/(light+.05)
}

/** Preserve the hue, blending only as far toward the theme foreground as needed. */
export function readableInk(color: string, dark: boolean): string {
  if (!/^#[\da-f]{6}$/i.test(color)) return defaultInk(dark)
  const normalized=color.toUpperCase()
  if (drawingContrast(normalized,dark)>=4.5) return normalized
  if (normalized==='#000000' || normalized==='#FFFFFF') return defaultInk(dark)
  const rgb=[1,3,5].map(i=>parseInt(normalized.slice(i,i+2),16))
  const target=dark?255:0
  let low=0, high=1
  for(let i=0;i<12;i++){
    const middle=(low+high)/2
    const mixed=hex(rgb.map(v=>v+(target-v)*middle))
    if(drawingContrast(mixed,dark)>=4.5)high=middle
    else low=middle
  }
  const adjusted=hex(rgb.map(v=>v+(target-v)*high))
  return drawingContrast(adjusted,dark)>=4.5 ? adjusted : defaultInk(dark)
}

export function drawingPalette(dark: boolean): string[] {
  return [...new Set([defaultInk(dark),...colorPalette.filter(c=>c!=='#000000'&&c!=='#FFFFFF').map(c=>readableInk(c,dark))])]
}

/** Update ink only; the transparent layer and eraser history remain intact. */
export function adaptDrawingInk(image: ImageData, dark: boolean, cache = new Map<number, number>()): void {
  const data=image.data
  for(let i=0;i<data.length;i+=4){
    if(!data[i+3])continue
    const key=(data[i]!<<16)|(data[i+1]!<<8)|data[i+2]!
    let value=cache.get(key)
    if(value===undefined){
      value=parseInt(readableInk('#'+key.toString(16).padStart(6,'0'),dark).slice(1),16)
      if(cache.size<4096)cache.set(key,value)
    }
    data[i]=value>>16;data[i+1]=(value>>8)&255;data[i+2]=value&255
  }
}
