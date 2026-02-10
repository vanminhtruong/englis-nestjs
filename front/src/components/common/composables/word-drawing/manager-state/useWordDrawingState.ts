
import { ref, computed } from "vue";
import type { KeyboardKey } from "./wordDrawingData";

export function useWordDrawingState() {
    // Canvas refs
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const ctx = ref<CanvasRenderingContext2D | null>(null);

    // Input mode
    const inputMode = ref<"draw" | "keyboard">("draw");

    // Drawing state
    const isDrawing = ref(false);
    const hasDrawn = ref(false);
    const brushSize = ref(5);
    const brushColor = ref("#000000");
    const currentTool = ref<"brush" | "eraser">("brush");
    const canvasBackground = ref<"white" | "transparent">("white");
    const previewDataUrl = ref("");
    const wordText = ref("");

    // OCR state
    const isRecognizing = ref(false);
    const ocrLanguage = ref("chi_sim");

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
        if (inputMode.value === "draw") {
            return hasDrawn.value && wordText.value.trim().length > 0;
        } else {
            return wordText.value.trim().length > 0;
        }
    });

    // Key preview state
    const activeKeyPreview = ref<string | null>(null);

    return {
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
    };
}
