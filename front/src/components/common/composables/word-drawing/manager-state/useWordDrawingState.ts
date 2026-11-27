
import { ref, computed } from "vue";
import { drawingBackground, defaultInk, drawingPalette } from './drawingColors';
import type { KeyboardKey } from "./wordDrawingData";

export function useWordDrawingState() {
    // Canvas refs
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const ctx = ref<CanvasRenderingContext2D | null>(null);

    // Input mode
    const inputMode = ref<"draw" | "keyboard">("draw");

    // Drawing state
    const isDrawing = ref(false);
    const touchpadMode = ref(false);
    const touchpadArmed = ref(false);
    const hasDrawn = ref(false);
    const brushSize = ref(5);
    const darkDrawing = ref(document.documentElement.classList.contains("dark"));
    const surfaceColor = computed(()=>drawingBackground(darkDrawing.value));
    const palette = computed(()=>drawingPalette(darkDrawing.value));
    const brushColor = ref(defaultInk(darkDrawing.value));
    const currentTool = ref<"brush" | "eraser">("brush");
    const canvasBackground = ref<"theme" | "transparent">("theme");
    const previewDataUrl = ref("");
    const wordText = ref("");

    // OCR state
    const isRecognizing = ref(false);
    const strokeCandidates = ref<import('../manager-handle/hanziRecognition').HanziCandidate[][]>([]);
    const chosenCharacters = ref<string[]>([]);
    const recognitionStatus = ref<'idle' | 'ready' | 'empty' | 'error'>('idle');
    const ocrLanguage = ref("chi_sim");
    const recognitionUnit = ref<import('../manager-handle/latinRecognition').RecognitionUnit>('auto');

    // History for undo/redo
    const history = ref<ImageData[]>([]);
    const historyIndex = ref(-1);

    // Keyboard state
    const keyboardLanguage = ref<"english" | "chinese">("english");
    const keyboardInputText = ref("");
    const isShift = ref(false);
    const selectedTone = ref<0 | 1 | 2 | 3 | 4>(0);

    // Pinyin IME state
    const pinyinBuffer = ref("");
    const hanziCandidates = ref<string[]>([]);

    // Computed to check if can confirm
    const canConfirm = computed(() => {
        if (isRecognizing.value || isDrawing.value) return false;
        if (inputMode.value === "draw") {
            return hasDrawn.value;
        } else {
            return !!(wordText.value.trim() || keyboardInputText.value.trim() || pinyinBuffer.value.trim());
        }
    });

    // Key preview state
    const activeKeyPreview = ref<string | null>(null);

    return {
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
        palette,
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
    };
}
