
import { nextTick } from "vue";
import { adaptDrawingInk, defaultInk, readableInk } from '../manager-state/drawingColors';
import { recognizeDrawing } from './drawingRecognition';
import { continuousW, latinCandidates, isLatinLanguage, type RecognitionUnit } from './latinRecognition';
import { recognizeHanziStrokes, type Stroke } from './hanziRecognition';
import {
    pinyinToHanzi,
    pinyinTones,
    tonedVowelToBase,
    tonedToBaseMap,
    type KeyboardKey,
} from "../manager-state/wordDrawingData";

export function useWordDrawingHandle(
    state: any,
    emit: {
        (event: "close"): void;
        (event: "confirm", payload: { imageDataUrl: string; word: string }): void;
    }
) {
    const {
        canvasRef,
        ctx,
        inputMode,
        isDrawing,
        touchpadMode,
        touchpadArmed,
        hasDrawn,
        brushSize,
        brushColor,
        darkDrawing,
        surfaceColor,
        currentTool,
        canvasBackground,
        previewDataUrl,
        wordText,
        isRecognizing,
        recognitionStatus,
        strokeCandidates,
        chosenCharacters,
        ocrLanguage,
        recognitionUnit,
        history,
        historyIndex,
        keyboardLanguage,
        keyboardInputText,
        isShift,
        selectedTone,
        pinyinBuffer,
        hanziCandidates,
        canConfirm,
        activeKeyPreview,
    } = state;

    let previewTimeout: number | undefined;
    let strokes: Stroke[] = [];
    let strokeHistory: { strokes: Stroke[]; valid: boolean }[] = [];
    let strokesValid = true;
    let activeStroke: Stroke | null = null;
    let activePointerId: number | null = null;
    let hoverStroke = false;
    let lastPoint: {x: number; y: number} | null = null;
    let previewFrame: number | null = null;
    let recognitionVersion = 0;
    let drawText = '';
    let drawStatus = 'idle';
    const invalidateRecognition = (clearText = true) => {
        recognitionVersion++;
        isRecognizing.value = false;
        recognitionStatus.value = 'idle';
        strokeCandidates.value = [];
        chosenCharacters.value = [];
        if (clearText) wordText.value = '';
    };
    const resetRecognition = () => { touchpadArmed.value=false; touchpadMode.value=false; hoverStroke=false; releasePointer(); isDrawing.value=false; lastPoint=null; if(previewFrame!==null){cancelAnimationFrame(previewFrame);previewFrame=null;} strokes=[]; strokeHistory=[]; strokesValid=true; activeStroke=null; invalidateRecognition(); drawText = ''; drawStatus = 'idle'; if (previewTimeout) clearTimeout(previewTimeout); };
    const setWordText = (value: string) => {
        invalidateRecognition(false);
        wordText.value = value;
        if(inputMode.value==='keyboard') { keyboardInputText.value=value; clearPinyinBuffer(); }
    };
    const chooseCharacter = (index: number, character: string) => {
        if (!strokeCandidates.value[index]?.some((candidate: {hanzi:string})=>candidate.hanzi===character)) return;
        chosenCharacters.value[index] = character;
        wordText.value = chosenCharacters.value.join('');
    };
    const setRecognitionUnit = (unit: RecognitionUnit) => { if(unit!==recognitionUnit.value){recognitionUnit.value=unit;invalidateRecognition();} };
    const setRecognitionLanguage = (language: string) => { if(language!==ocrLanguage.value){ocrLanguage.value=language;invalidateRecognition();} };
    const setMode = (mode: 'draw' | 'keyboard') => {
        if(mode===inputMode.value)return;
        pauseTouchpad();
        if(isDrawing.value)stopDrawing();
        if(mode==='keyboard') { drawText=wordText.value; drawStatus=recognitionStatus.value; invalidateRecognition(); wordText.value=keyboardInputText.value; }
        else { invalidateRecognition(); wordText.value=drawText; recognitionStatus.value=drawStatus; }
        inputMode.value=mode;
    };

    const triggerKeyPreview = (key: string) => {
        activeKeyPreview.value = key;
        if (previewTimeout) clearTimeout(previewTimeout);
        previewTimeout = window.setTimeout(() => {
            activeKeyPreview.value = null;
        }, 1000);
    };

    // -- Pinyin / Keyboard Handlers --

    const normalizePinyin = (pinyin: string): string => {
        let result = "";
        for (const char of pinyin) {
            result += tonedToBaseMap[char] || char;
        }
        return result;
    };

    const updateHanziCandidates = () => {
        const rawPinyin = pinyinBuffer.value.toLowerCase();
        if (!rawPinyin) {
            hanziCandidates.value = [];
            return;
        }

        const pinyin = normalizePinyin(rawPinyin);

        if (pinyinToHanzi[pinyin]) {
            hanziCandidates.value = pinyinToHanzi[pinyin].slice(0, 10);
            return;
        }

        const matches: string[] = [];
        for (const [py, chars] of Object.entries(pinyinToHanzi)) {
            if (py.startsWith(pinyin)) {
                matches.push(...chars.slice(0, 3));
                if (matches.length >= 10) break;
            }
        }
        hanziCandidates.value = matches.slice(0, 10);
    };

    const selectHanzi = (char: string) => {
        keyboardInputText.value += char;
        pinyinBuffer.value = "";
        hanziCandidates.value = [];
        selectedTone.value = 0;
    };

    const clearPinyinBuffer = () => {
        pinyinBuffer.value = "";
        hanziCandidates.value = [];
        selectedTone.value = 0;
    };

    const insertCharacter = (char: string) => {
        keyboardInputText.value += char;
        selectedTone.value = 0;
    };

    const getTonedVowels = (): string[] => {
        const tone = selectedTone.value;
        if (tone === 0) {
            return ["a", "e", "i", "o", "u", "ü"];
        }
        const vowels = ["a", "e", "i", "o", "u", "v"];
        return vowels.map(v => pinyinTones[v]?.[tone] || v);
    };

    const applyToneToBuffer = (tone: 0 | 1 | 2 | 3 | 4) => {
        selectedTone.value = tone;
        if (tone === 0 || !pinyinBuffer.value) {
            return;
        }

        const buffer = pinyinBuffer.value;
        const vowels = ["a", "e", "i", "o", "u", "v", "ü"];
        const tonedVowels = Object.keys(tonedVowelToBase);

        let lastVowelIndex = -1;
        let lastVowelChar = "";

        for (let i = buffer.length - 1; i >= 0; i--) {
            const char = buffer[i].toLowerCase();
            if (vowels.includes(char)) {
                lastVowelIndex = i;
                lastVowelChar = char === "ü" ? "v" : char;
                break;
            }
            if (tonedVowels.includes(buffer[i])) {
                lastVowelIndex = i;
                lastVowelChar = tonedVowelToBase[buffer[i]] || "a"; // Fallback to satisfy type, though strictly guarded by includes
                break;
            }
        }

        if (lastVowelIndex === -1) {
            return;
        }

        const tonedChars = pinyinTones[lastVowelChar];
        if (!tonedChars) return;

        const tonedChar = tonedChars[tone];
        pinyinBuffer.value =
            buffer.substring(0, lastVowelIndex) +
            tonedChar +
            buffer.substring(lastVowelIndex + 1);

        updateHanziCandidates();
        selectedTone.value = 0;
    };

    const handleKeyPress = (key: KeyboardKey) => {
        // Trigger preview
        triggerKeyPreview(key.value);

        if (key.value === "backspace") {
            keyboardInputText.value = keyboardInputText.value.slice(0, -1);
        } else if (key.value === "space") {
            keyboardInputText.value += " ";
        } else {
            const char = isShift.value
                ? key.label.toUpperCase()
                : key.label.toLowerCase();
            keyboardInputText.value += char;
        }
    };

    const handlePinyinKeyPress = (key: KeyboardKey) => {
        // Trigger preview
        triggerKeyPreview(key.value);

        if (key.value === "backspace") {
            if (pinyinBuffer.value.length > 0) {
                pinyinBuffer.value = pinyinBuffer.value.slice(0, -1);
                updateHanziCandidates();
            } else {
                keyboardInputText.value = keyboardInputText.value.slice(0, -1);
            }
        } else if (key.value === "space") {
            if (pinyinBuffer.value && hanziCandidates.value.length > 0) {
                selectHanzi(hanziCandidates.value[0]);
            } else if (pinyinBuffer.value) {
                keyboardInputText.value += pinyinBuffer.value;
                pinyinBuffer.value = "";
                hanziCandidates.value = [];
                selectedTone.value = 0;
            } else {
                keyboardInputText.value += " ";
            }
        } else if (key.type === "vowel" && selectedTone.value > 0) {
            const vowelKey = key.value === "v" ? "v" : key.value;
            const tones = pinyinTones[vowelKey];
            if (tones) {
                pinyinBuffer.value += tones[selectedTone.value];
            } else {
                pinyinBuffer.value += key.label;
            }
            updateHanziCandidates();
            selectedTone.value = 0;
        } else if (!/^[a-zA-Z]$/.test(key.value)) {
            // Punctuation or non-letter: commit pinyin and insert char
            if (pinyinBuffer.value && hanziCandidates.value.length > 0) {
                selectHanzi(hanziCandidates.value[0]);
            } else if (pinyinBuffer.value) {
                keyboardInputText.value += pinyinBuffer.value;
                pinyinBuffer.value = "";
                hanziCandidates.value = [];
                selectedTone.value = 0;
            }

            let charToInsert = key.label;
            // Map common Chinese punctuation
            if (keyboardLanguage.value === "chinese") {
                const punctuationMap: Record<string, string> = {
                    "-": "－",
                    ",": "，",
                    ".": "。",
                    "!": "！",
                    "?": "？",
                    ":": "：",
                    ";": "；",
                    "(": "（",
                    ")": "）",
                    "_": "——",
                    "=": "＝",
                    "+": "＋",
                };
                charToInsert = punctuationMap[charToInsert] || charToInsert;
            }
            keyboardInputText.value += charToInsert;
            updateHanziCandidates();
        } else {
            pinyinBuffer.value += key.label;
            updateHanziCandidates();
        }
    };

    const handlePhysicalKeyDown = (e: KeyboardEvent) => {
        if (inputMode.value !== "keyboard" || e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || (e.target instanceof HTMLElement && (e.target.matches('input,textarea,select') || e.target.isContentEditable))) return;

        const keyObj: KeyboardKey = {
            value: e.key.toLowerCase(),
            label: e.key,
            type: "normal", // Default, will be refined if needed
        };

        if (e.key === "Backspace") {
            keyObj.value = "backspace";
            keyObj.label = "⌫";
            keyObj.type = "special";
        } else if (e.key === " ") {
            keyObj.value = "space";
            keyObj.label = "Space";
            keyObj.type = "special";
        } else if (e.key.length === 1) {
            // Allow all single character keys (letters, numbers, punctuation)
        } else {
            // Ignore other keys for now (like Enter, arrows, etc unless we want to handle them)
            return;
        }

        if (keyboardLanguage.value === "english") {
            // Check shift key state from event updates our internal state?
            // Or just trust the key produced.
            // Our handleKeyPress uses internal `isShift`.
            // If user presses physical Shift, we might want to sync.
            // But simpler is to direct map:

            // If physical Shift is held, we might want to update `isShift`.
            // But `handleKeyPress` relies on `isShift` toggle button.
            // Let's rely on the physical key char.

            // Actually, handleKeyPress takes a Key object from our virtual keyboard.
            // Just mapping to that structure.

            if (e.key === 'Shift') {
                isShift.value = !isShift.value; // Toggle or hold? 
                // Physical shift usually hold. Toggle button is for mouse.
                // Let's just ignore physical Shift for now to avoid complexity with toggle state.
                return;
            }

            e.preventDefault();
            if (e.key.length === 1 && e.key !== ' ') keyboardInputText.value += e.key;
            else handleKeyPress(keyObj);
        } else {
            // Chinese
            // Custom Tone Mapping (Unikey-style as requested)
            if (pinyinBuffer.value) {
                const char = e.key.toLowerCase();
                const hasVowel = /[aeiouüv]/i.test(pinyinBuffer.value) ||
                    Object.keys(tonedVowelToBase).some(v => pinyinBuffer.value.includes(v));

                if (hasVowel) {
                    if (char === '-') {
                        applyToneToBuffer(1);
                        e.preventDefault();
                        return;
                    }
                    if (char === 's') {
                        applyToneToBuffer(2); // Sắc / Acute / Rising
                        e.preventDefault();
                        return;
                    }
                    if (char === 'r') {
                        applyToneToBuffer(3); // Hỏi / Hook / Dipping
                        e.preventDefault();
                        return;
                    }
                    if (char === 'f') {
                        applyToneToBuffer(4); // Huyền / Grave / Falling
                        e.preventDefault();
                        return;
                    }
                }
            }

            // We need to map to pinyin logic.
            // Pinyin logic uses `activeKeyPreview` based on key value.

            // Refine type for pinyin
            const vowels = ['a', 'e', 'i', 'o', 'u', 'v'];
            if (vowels.includes(keyObj.value)) {
                keyObj.type = "vowel";
            } else {
                keyObj.type = "consonant";
            }

            e.preventDefault();
            handlePinyinKeyPress(keyObj);
        }
    };

    const useKeyboardText = () => {
        if (pinyinBuffer.value) {
            if (hanziCandidates.value.length) selectHanzi(hanziCandidates.value[0]);
            else { keyboardInputText.value += pinyinBuffer.value; clearPinyinBuffer(); }
        }
        wordText.value = keyboardInputText.value.trim();
    };

    const clearKeyboardInput = () => {
        keyboardInputText.value = "";
        wordText.value = "";
        clearPinyinBuffer();
    };

    // -- Canvas / Drawing Handlers --

    const fillBackground = () => {
        if (!ctx.value || !canvasRef.value) return;

        ctx.value.globalCompositeOperation = "source-over";
        // Keep only ink in the drawing bitmap. The background is a separate
        // display/export layer so erasing never exposes a dark patch on white.
        ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    };

    const exportDrawing = (): string => {
        const canvas = canvasRef.value as HTMLCanvasElement | null;
        if (!canvas) return '';
        if (canvasBackground.value === 'transparent') return canvas.toDataURL('image/png');
        const output = document.createElement('canvas');
        output.width = canvas.width;
        output.height = canvas.height;
        const outputCtx = output.getContext('2d');
        if (!outputCtx) return '';
        outputCtx.fillStyle = surfaceColor.value;
        outputCtx.fillRect(0, 0, output.width, output.height);
        outputCtx.drawImage(canvas, 0, 0);
        return output.toDataURL('image/png');
    };

    const hasInk = () => {
        if (!ctx.value || !canvasRef.value) return false;
        const pixels = ctx.value.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height).data;
        // Count visible alpha, independent of the brush color or theme.
        for (let i=3; i<pixels.length; i+=4) {
            if (pixels[i]! > 8) return true;
        }
        return false;
    };

    const updatePreview = () => {
        if (!canvasRef.value) return;
        previewDataUrl.value = hasDrawn.value ? exportDrawing() : '';
    };

    // Avoid encoding a PNG for every high-frequency pointer sample.
    const schedulePreview = () => {
        if (previewFrame !== null) return;
        previewFrame = requestAnimationFrame(() => {
            previewFrame = null;
            updatePreview();
        });
    };
    const flushPreview = () => {
        if (previewFrame !== null) cancelAnimationFrame(previewFrame);
        previewFrame = null;
        updatePreview();
    };

    const saveToHistory = () => {
        if (!ctx.value || !canvasRef.value) return;

        if (historyIndex.value < history.value.length - 1) {
            history.value = history.value.slice(0, historyIndex.value + 1);
            strokeHistory = strokeHistory.slice(0, historyIndex.value + 1);
        }

        const imageData = ctx.value.getImageData(
            0,
            0,
            canvasRef.value.width,
            canvasRef.value.height
        );
        history.value.push(imageData);
        strokeHistory.push({strokes: [...strokes],valid:strokesValid});
        historyIndex.value = history.value.length - 1;

        if (history.value.length > 50) {
            history.value.shift();
            strokeHistory.shift();
            historyIndex.value--;
        }
    };

    const initCanvas = async () => {
        // Ensure canvas is in DOM
        await nextTick();
        if (!canvasRef.value) return;

        const canvas = canvasRef.value;
        const container = canvas.parentElement;

        if (!container) return;

        const rect = container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        canvas.width = Math.max(1, Math.round(rect.width));
        canvas.height = Math.max(1, Math.round(rect.height));

        ctx.value = canvas.getContext("2d");
        if (!ctx.value) return;

        fillBackground();
        saveToHistory();
    };


    const getPointerPos = (e: PointerEvent) => {
        const canvas = canvasRef.value as HTMLCanvasElement | null;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return { x: 0, y: 0 };
        return {
            x: Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * canvas.width / rect.width)),
            y: Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * canvas.height / rect.height)),
        };
    };

    const releasePointer = () => {
        const id = activePointerId;
        activePointerId = null;
        const canvas = canvasRef.value as HTMLCanvasElement | null;
        if (canvas && id !== null && canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    };

    const beginStroke = (e: PointerEvent, hover = false) => {
        if (!ctx.value || inputMode.value !== 'draw' || isRecognizing.value ||
            activePointerId !== null || !e.isPrimary) return;
        hoverStroke = hover;
        e.preventDefault();
        activePointerId = e.pointerId;
        const canvas = canvasRef.value as HTMLCanvasElement | null;
        // Capture keeps the stroke active even when the finger crosses the edge.
        // Synthetic events in tests may not have a browser-managed pointer.
        try { if (!hover) canvas?.setPointerCapture(e.pointerId); } catch { /* Ignore unavailable capture. */ }
        invalidateRecognition();
        isDrawing.value = true;
        const pos = getPointerPos(e);
        lastPoint = pos;
        activeStroke = currentTool.value === 'brush' ? [[pos.x, pos.y]] : null;
        if (!activeStroke) strokesValid = false;

        ctx.value.beginPath();
        ctx.value.moveTo(pos.x, pos.y);
        ctx.value.lineWidth = brushSize.value;
        ctx.value.lineCap = 'round';
        ctx.value.lineJoin = 'round';
        ctx.value.globalCompositeOperation = currentTool.value === 'eraser' ? 'destination-out' : 'source-over';
        ctx.value.strokeStyle = currentTool.value === 'eraser' ? 'rgba(0,0,0,1)' : brushColor.value;
        ctx.value.lineTo(pos.x + 0.01, pos.y + 0.01);
        ctx.value.stroke();
        ctx.value.beginPath();
        ctx.value.moveTo(pos.x, pos.y);
        if (activeStroke) hasDrawn.value = true;
        schedulePreview();
    };

    const pauseTouchpad = () => {
        touchpadArmed.value = false;
        if (hoverStroke) stopDrawing(undefined, false);
    };

    const toggleTouchpadMode = () => {
        pauseTouchpad();
        if (isDrawing.value) stopDrawing();
        touchpadMode.value = !touchpadMode.value;
    };

    const toggleTouchpadStroke = () => {
        if (!touchpadMode.value || inputMode.value !== 'draw' || isRecognizing.value) return;
        if (touchpadArmed.value) pauseTouchpad();
        else if (!isDrawing.value) touchpadArmed.value = true;
    };

    const startDrawing = (e: PointerEvent) => {
        if (!e.isPrimary || e.button !== 0) return;
        if (touchpadMode.value && e.pointerType === 'mouse') {
            e.preventDefault();
            toggleTouchpadStroke();
            return;
        }
        pauseTouchpad();
        beginStroke(e);
    };

    const handlePointerLeave = () => pauseTouchpad();

    const appendPoint = (e: PointerEvent) => {
        if (!ctx.value) return;
        const pos = getPointerPos(e);
        if (lastPoint && pos.x === lastPoint.x && pos.y === lastPoint.y) return;
        if (activeStroke && activeStroke.length < 2048) activeStroke.push([pos.x, pos.y]);
        ctx.value.lineTo(pos.x, pos.y);
        ctx.value.stroke();
        ctx.value.beginPath();
        ctx.value.moveTo(pos.x, pos.y);
        lastPoint = pos;
        if (activeStroke) hasDrawn.value = true;
    };

    const draw = (e: PointerEvent) => {
        if (touchpadMode.value && touchpadArmed.value && e.pointerType === 'mouse' && e.buttons === 0 && !isDrawing.value) beginStroke(e, true);
        if (!isDrawing.value || activePointerId !== e.pointerId || !ctx.value) return;
        e.preventDefault();
        // A missing mouse/pen release must not leave the brush stuck on.
        if (!hoverStroke && e.pointerType !== 'touch' && (e.buttons & 1) === 0) {
            stopDrawing(e, false);
            return;
        }
        const samples = e.getCoalescedEvents?.() ?? [];
        for (const sample of samples) appendPoint(sample);
        appendPoint(e);
        schedulePreview();
    };

    const stopDrawing = (e?: PointerEvent, includeEnd = true) => {
        if (e && activePointerId !== e.pointerId) return;
        if (hoverStroke && e?.type === 'pointerup') return;
        if (isDrawing.value && ctx.value) {
            if (e && includeEnd && e.type === 'pointerup') appendPoint(e);
            ctx.value.beginPath();
            ctx.value.globalCompositeOperation = 'source-over';
            if (activeStroke) {
                if (activeStroke.length === 1) activeStroke.push([activeStroke[0]![0]!+0.01, activeStroke[0]![1]!+0.01]);
                strokes.push(activeStroke);
                activeStroke = null;
            }
            hasDrawn.value = hasInk();
            // If all ink was erased, a new character can use stroke matching again.
            if (!hasDrawn.value) { strokes = []; strokesValid = true; }
            saveToHistory();
        }
        isDrawing.value = false;
        if (hoverStroke) touchpadArmed.value = false;
        hoverStroke = false;
        lastPoint = null;
        releasePointer();
        flushPreview();
    };

    const cancelDrawing = (e: PointerEvent) => stopDrawing(e, false);

    const undoLast = () => {
        if (isDrawing.value || historyIndex.value <= 0 || !ctx.value) return;

        invalidateRecognition();
        historyIndex.value--;
        ctx.value.putImageData(history.value[historyIndex.value], 0, 0);
        const saved = strokeHistory[historyIndex.value];
        strokes = saved ? [...saved.strokes] : [];
        strokesValid = saved?.valid ?? false;
        hasDrawn.value = hasInk();
        updatePreview();
    };

    const redoLast = () => {
        if (isDrawing.value || historyIndex.value >= history.value.length - 1 || !ctx.value) return;

        invalidateRecognition();
        historyIndex.value++;
        ctx.value.putImageData(history.value[historyIndex.value], 0, 0);
        const saved = strokeHistory[historyIndex.value];
        strokes = saved ? [...saved.strokes] : [];
        strokesValid = saved?.valid ?? false;
        hasDrawn.value = hasInk();
        updatePreview();
    };

    const clearCanvas = () => {
        if (!ctx.value || !canvasRef.value) return;

        if (isDrawing.value) stopDrawing();
        invalidateRecognition();
        strokes=[]; strokesValid=true; activeStroke=null;
        ctx.value.globalCompositeOperation = 'source-over';
        fillBackground();
        hasDrawn.value = false;
        saveToHistory();
        updatePreview();
    };

    const chooseBrushColor = (color: string) => {
        if (isDrawing.value) stopDrawing();
        brushColor.value = readableInk(color, darkDrawing.value);
    };

    const syncDrawingTheme = (dark: boolean, fresh = false) => {
        if (fresh) {
            darkDrawing.value = dark;
            brushColor.value = defaultInk(dark);
            canvasBackground.value = 'theme';
            return;
        }
        if (dark === darkDrawing.value) return;
        if (isDrawing.value) stopDrawing();
        brushColor.value = readableInk(brushColor.value, dark);
        darkDrawing.value = dark;
        const cache = new Map<number, number>();
        for (const image of history.value as ImageData[]) adaptDrawingInk(image, dark, cache);
        if (ctx.value && canvasRef.value && hasDrawn.value) {
            const current = ctx.value.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height);
            adaptDrawingInk(current, dark, cache);
            ctx.value.putImageData(current, 0, 0);
        }
        updatePreview();
    };

    const handleBackgroundChange = () => {
        // Changing the background does not alter ink or undo history.
        updatePreview();
    };

    const recognizeText = async () => {
        if (!canvasRef.value || !hasDrawn.value || isRecognizing.value || isDrawing.value) return;
        const version = ++recognitionVersion;
        isRecognizing.value = true;
        recognitionStatus.value = 'idle';
        wordText.value = '';
        try {
            let word = '';
            const language = ocrLanguage.value;
            const unit = recognitionUnit.value;
            if (isLatinLanguage(language) && strokesValid && strokes.length && unit !== 'word') {
                const isW = language==='eng' && continuousW(strokes);
                const options = isW || unit==='character' || (language==='eng' && strokes.length<=3) ? latinCandidates(strokes) : [];
                const top=options[0];
                const next=options.find(item=>item.hanzi.toLowerCase()!==top?.hanzi.toLowerCase());
                // Auto only accepts an unusually close, distinct match; longer words stay with OCR.
                const clearLetter=language==='eng' && !!top && !!next && top.hanzi.toLowerCase()!=='w' && top.score<.004 && next.score-top.score>.003;
                if (isW || (unit==='character' && language==='eng' && top && top.score<.025) || (unit==='auto' && clearLetter)) {
                    const preferred = isW ? [{hanzi:'w',score:0},{hanzi:'W',score:0}] : [];
                    const merged = [...preferred,...options].filter((item,i,all)=>all.findIndex(other=>other.hanzi===item.hanzi)===i).slice(0,8);
                    strokeCandidates.value=[merged];
                    chosenCharacters.value=[merged[0]!.hanzi];
                    word=chosenCharacters.value[0]!;
                }
            }
            if(!word && ocrLanguage.value.startsWith('chi_') && strokesValid && strokes.length){
                try{
                    const candidates = await recognizeHanziStrokes(strokes);
                    if(version !== recognitionVersion || inputMode.value !== 'draw')return;
                    if(candidates.length && (unit!=='character'||candidates.length===1)){
                        strokeCandidates.value=candidates;
                        chosenCharacters.value=candidates.map(group=>group[0]!.hanzi);
                        word=chosenCharacters.value.join('');
                    }
                }catch{ /* Fall back to local OCR when stroke matching is unavailable. */ }
            }
            if(!word) word = await recognizeDrawing(canvasRef.value, language, unit);
            if(version !== recognitionVersion || inputMode.value !== 'draw') return;
            if(isLatinLanguage(language) && unit==='character' && !strokeCandidates.value.length && strokesValid){
                const candidates=latinCandidates(strokes);
                if(word) candidates.unshift({hanzi:word,score:0});
                const unique=candidates.filter((item,i,all)=>all.findIndex(other=>other.hanzi===item.hanzi)===i).slice(0,8);
                if(unique.length){strokeCandidates.value=[unique];chosenCharacters.value=[unique[0]!.hanzi];word=unique[0]!.hanzi;}
            }
            if (version !== recognitionVersion || inputMode.value !== 'draw') return;
            wordText.value = word;
            recognitionStatus.value = word ? 'ready' : 'empty';
        } catch (error) {
            if (version !== recognitionVersion) return;
            recognitionStatus.value = 'error';
            console.warn('Drawing recognition unavailable', error);
        } finally {
            if (version === recognitionVersion) isRecognizing.value = false;
        }
    };

    const confirm = async () => {
        if (!canConfirm.value) return;
        if (inputMode.value === "draw") {
            if (!canvasRef.value) return;
            if (!wordText.value.trim()) { await recognizeText(); return; }
            emit("confirm", { imageDataUrl: exportDrawing(), word: wordText.value.trim() });
        } else {
            if (pinyinBuffer.value) {
                if (hanziCandidates.value.length) selectHanzi(hanziCandidates.value[0]);
                else { keyboardInputText.value += pinyinBuffer.value; clearPinyinBuffer(); }
            }
            const word = (keyboardInputText.value || wordText.value).trim();
            if (!word) return;
            emit("confirm", { imageDataUrl: "", word });
        }
        emit("close");
    };

    const close = () => {
        resetRecognition();
        emit("close");
    };

    return {
        resetRecognition,
        setWordText,
        chooseCharacter,
        setRecognitionLanguage,
        setRecognitionUnit,
        setMode,
        handleKeyPress,
        handlePinyinKeyPress,
        selectHanzi,
        clearPinyinBuffer,
        insertCharacter,
        getTonedVowels,
        applyToneToBuffer,
        useKeyboardText,
        fillBackground,
        updatePreview,
        saveToHistory,
        initCanvas,
        startDrawing,
        toggleTouchpadMode,
        toggleTouchpadStroke,
        pauseTouchpad,
        handlePointerLeave,
        draw,
        stopDrawing,
        cancelDrawing,
        undoLast,
        redoLast,
        clearCanvas,
        handleBackgroundChange,
        chooseBrushColor,
        syncDrawingTheme,
        recognizeText,
        confirm,
        close,
        clearKeyboardInput,
        handlePhysicalKeyDown,
    };
}
