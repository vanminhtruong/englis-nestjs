import type { RecognitionUnit } from './latinRecognition'
import { createWorker, PSM, OEM, type Worker } from 'tesseract.js'
import workerPath from 'tesseract.js/dist/worker.min.js?url'
import corePath from 'tesseract.js-core/tesseract-core-lstm.wasm.js?url'

export function cleanRecognizedWord(raw: string, language: string) {
  let result = raw.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '').trim().replace(/\s+/gu, ' ')
  if (language.startsWith('chi_') || language === 'jpn') {
    result = result.replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])\s+(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu, '$1')
  }
  return /[\p{L}\p{N}]/u.test(result) ? result : ''
}

/** Flatten transparency, isolate the drawn ink and add a clean OCR border. */
export function prepareDrawing(canvas: HTMLCanvasElement): HTMLCanvasElement | null {
  const ctx = canvas.getContext('2d')
  if (!ctx || !canvas.width || !canvas.height) return null
  const { width, height } = canvas
  const pixels = ctx.getImageData(0, 0, width, height).data
  let left = width, right = -1, top = height, bottom = -1
  for (let y=0; y<height; y++) for (let x=0; x<width; x++) {
    const i=(y*width+x)*4
    // The bitmap contains ink only: detect alpha, not brightness.
    if (pixels[i+3]! < 32) continue
    left=Math.min(left,x); right=Math.max(right,x); top=Math.min(top,y); bottom=Math.max(bottom,y)
  }
  if (right < left) return null
  const w=right-left+1, h=bottom-top+1
  const scale=Math.min(3, 1600/Math.max(w,h), Math.max(1, 240/h))
  const pad=24
  const result=document.createElement('canvas')
  result.width=Math.max(1,Math.round(w*scale))+pad*2
  result.height=Math.max(1,Math.round(h*scale))+pad*2
  const out=result.getContext('2d')!
  out.drawImage(canvas,left,top,w,h,pad,pad,result.width-pad*2,result.height-pad*2)
  const image=out.getImageData(0,0,result.width,result.height)
  for(let i=0;i<image.data.length;i+=4) {
    const value=image.data[i+3]!>=64?0:255
    image.data[i]=image.data[i+1]=image.data[i+2]=value
    image.data[i+3]=255
  }
  out.putImageData(image,0,0)
  return result
}

export async function recognizeDrawing(canvas: HTMLCanvasElement, language: string, unit: RecognitionUnit = 'auto'): Promise<string> {
  const prepared=prepareDrawing(canvas)
  if(!prepared)return ''
  let worker: Worker | undefined
  let expired = false
  let timeout: ReturnType<typeof setTimeout> | undefined
  const job = (async () => {
    worker = await createWorker(language, OEM.LSTM_ONLY, {
      workerPath: new URL(workerPath, window.location.href).href,
      corePath: new URL(corePath, window.location.href).href,
      workerBlobURL: false,
      errorHandler: () => { /* Report through the rejected recognition job. */ },
    })
    if (expired) { await worker.terminate(); throw new Error('Recognition cancelled') }
    return worker
  })()
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => { expired = true; reject(new Error('Recognition timed out')) }, 60000)
  })
  try {
    const activeWorker = await Promise.race([job, deadline])
    let best={word:'',confidence:-1}
    const modes = unit==='character' ? [PSM.SINGLE_CHAR] : [PSM.SINGLE_WORD, PSM.SINGLE_LINE, PSM.SPARSE_TEXT]
    const alphabet = language==='eng' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' : language==='vie' ? 'AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXYaăâbcdđeêghiklmnoôơpqrstuưvxy' + 'ÀÁẢÃẠẰẮẲẴẶẦẤẨẪẬÈÉẺẼẸỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌỒỐỔỖỘỜỚỞỠỢÙÚỦŨỤỪỨỬỮỰỲÝỶỸỴàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ' : ''
    for(const mode of modes) {
      await Promise.race([activeWorker.setParameters({tessedit_pageseg_mode:mode,user_defined_dpi:'300',...(unit==='character'&&alphabet?{tessedit_char_whitelist:alphabet}: {})}), deadline])
      const {data}=await Promise.race([activeWorker.recognize(prepared), deadline])
      const word=cleanRecognizedWord(data.text,language)
      if(word && (unit!=='character'||Array.from(word).length===1) && data.confidence>best.confidence)best={word,confidence:data.confidence}
      if(best.word && best.confidence>=85)break
    }
    return best.word
  } finally { expired=true; clearTimeout(timeout); if(worker) await worker.terminate() }
}
