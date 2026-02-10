
import { nextTick } from "vue";
import { createWorker } from "tesseract.js";
import {
    pinyinToHanzi,
    pinyinTones,
    tonedVowelToBase,
    tonedToBaseMap,
    type KeyboardKey,
} from "../manager-state/wordDrawingData";

export function useWordDrawingHandle(
    state: any,
    emit: (event: "close" | "confirm", ...args: any[]) => void
) {
    const {
        canvasRef,
        ctx,
        inputMode,
        isDrawing,
        hasDrawn,
        brushSize,
        brushColor,
        currentTool,
        canvasBackground,
        previewDataUrl,
        wordText,
        isRecognizing,
        ocrLanguage,
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
        if (inputMode.value !== "keyboard") return;

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

            handleKeyPress(keyObj);
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

            handlePinyinKeyPress(keyObj);
        }
    };

    const useKeyboardText = () => {
        if (pinyinBuffer.value) {
            keyboardInputText.value += pinyinBuffer.value;
            pinyinBuffer.value = "";
            hanziCandidates.value = [];
            selectedTone.value = 0;
        }
        if (keyboardInputText.value.trim()) {
            wordText.value = keyboardInputText.value.trim();
        }
    };

    const clearKeyboardInput = () => {
        keyboardInputText.value = "";
        clearPinyinBuffer();
    };

    // -- Canvas / Drawing Handlers --

    const fillBackground = () => {
        if (!ctx.value || !canvasRef.value) return;

        if (canvasBackground.value === "white") {
            ctx.value.fillStyle = "#FFFFFF";
            ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
        } else {
            ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
        }
    };

    const updatePreview = () => {
        if (!canvasRef.value) return;
        previewDataUrl.value = canvasRef.value.toDataURL("image/png");
    };

    const saveToHistory = () => {
        if (!ctx.value || !canvasRef.value) return;

        if (historyIndex.value < history.value.length - 1) {
            history.value = history.value.slice(0, historyIndex.value + 1);
        }

        const imageData = ctx.value.getImageData(
            0,
            0,
            canvasRef.value.width,
            canvasRef.value.height
        );
        history.value.push(imageData);
        historyIndex.value = history.value.length - 1;

        if (history.value.length > 50) {
            history.value.shift();
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
        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx.value = canvas.getContext("2d");
        if (!ctx.value) return;

        fillBackground();
        saveToHistory();
    };


    const getPointerPos = (e: MouseEvent | Touch) => {
        if (!canvasRef.value) return { x: 0, y: 0 };

        const rect = canvasRef.value.getBoundingClientRect();
        const scaleX = canvasRef.value.width / rect.width;
        const scaleY = canvasRef.value.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e: MouseEvent) => {
        isDrawing.value = true;
        const pos = getPointerPos(e);

        if (!ctx.value) return;

        ctx.value.beginPath();
        ctx.value.moveTo(pos.x, pos.y);
        ctx.value.lineWidth = brushSize.value;
        ctx.value.lineCap = "round";
        ctx.value.lineJoin = "round";

        if (currentTool.value === "eraser") {
            ctx.value.globalCompositeOperation = "destination-out";
            ctx.value.strokeStyle = "rgba(0,0,0,1)";
        } else {
            ctx.value.globalCompositeOperation = "source-over";
            ctx.value.strokeStyle = brushColor.value;
        }
    };

    const draw = (e: MouseEvent) => {
        if (!isDrawing.value || !ctx.value) return;

        const pos = getPointerPos(e);
        ctx.value.lineTo(pos.x, pos.y);
        ctx.value.stroke();
        hasDrawn.value = true;
        updatePreview();
    };

    const stopDrawing = () => {
        if (isDrawing.value && ctx.value) {
            ctx.value.closePath();
            saveToHistory();
        }
        isDrawing.value = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        startDrawing(mouseEvent);
    };

    const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        const mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        draw(mouseEvent);
    };

    const undoLast = () => {
        if (historyIndex.value <= 0 || !ctx.value) return;

        historyIndex.value--;
        ctx.value.putImageData(history.value[historyIndex.value], 0, 0);
        updatePreview();
        hasDrawn.value = historyIndex.value > 0;
    };

    const redoLast = () => {
        if (historyIndex.value >= history.value.length - 1 || !ctx.value) return;

        historyIndex.value++;
        ctx.value.putImageData(history.value[historyIndex.value], 0, 0);
        updatePreview();
        hasDrawn.value = true;
    };

    const clearCanvas = () => {
        if (!ctx.value || !canvasRef.value) return;

        fillBackground();
        hasDrawn.value = false;
        saveToHistory();
        updatePreview();
    };

    const handleBackgroundChange = () => {
        if (!ctx.value || !canvasRef.value || !hasDrawn.value) {
            fillBackground();
            saveToHistory();
            return;
        }

        const currentImage = ctx.value.getImageData(
            0,
            0,
            canvasRef.value.width,
            canvasRef.value.height
        );

        fillBackground();

        ctx.value.putImageData(currentImage, 0, 0);
        updatePreview();
    };

    const recognizeText = async () => {
        if (!canvasRef.value || !hasDrawn.value || isRecognizing.value) return;

        isRecognizing.value = true;

        try {
            const dataUrl = canvasRef.value.toDataURL("image/png");

            const worker = await createWorker(ocrLanguage.value);
            const { data } = await worker.recognize(dataUrl);
            await worker.terminate();

            if (data.text && data.text.trim()) {
                wordText.value = data.text.trim().replace(/\s+/g, " ");
            }
        } catch (error) {
            console.error("OCR recognition failed:", error);
        } finally {
            isRecognizing.value = false;
        }
    };

    const confirm = () => {
        if (!canConfirm.value) return;

        if (inputMode.value === "draw") {
            if (!canvasRef.value) return;
            const dataUrl = canvasRef.value.toDataURL("image/png");
            emit("confirm", { imageDataUrl: dataUrl, word: wordText.value.trim() });
        } else {
            emit("confirm", { imageDataUrl: "", word: wordText.value.trim() });
        }
        emit("close");
    };

    const close = () => {
        emit("close");
    };

    return {
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
        draw,
        stopDrawing,
        handleTouchStart,
        handleTouchMove,
        undoLast,
        redoLast,
        clearCanvas,
        handleBackgroundChange,
        recognizeText,
        confirm,
        close,
        clearKeyboardInput,
        handlePhysicalKeyDown,
    };
}
