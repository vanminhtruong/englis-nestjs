import { watch, onMounted, onUnmounted, nextTick } from "vue";

export function useWordDrawingMount(
    state: any,
    handlers: any,
    props: { visible: boolean; word: string }
) {
    const { hasDrawn, history, historyIndex, previewDataUrl, wordText, inputMode,
        keyboardInputText, isShift, selectedTone, pinyinBuffer, hanziCandidates,
        canvasBackground, canvasRef, ctx, isDrawing, currentTool, touchpadMode } = state;
    let observer: ResizeObserver | null = null;
    let session = 0;
    let themeObserver: MutationObserver | null = null;

    watch(() => props.visible, async visible => {
        const current = ++session;
        observer?.disconnect();
        observer = null;
        handlers.resetRecognition();
        isDrawing.value = false;
        if (!visible) return;
        hasDrawn.value = false;
        history.value = [];
        historyIndex.value = -1;
        previewDataUrl.value = "";
        wordText.value = props.word || "";
        ctx.value = null;
        inputMode.value = "draw";
        currentTool.value = "brush";
        handlers.syncDrawingTheme(document.documentElement.classList.contains("dark"), true);
        keyboardInputText.value = "";
        isShift.value = false;
        selectedTone.value = 0;
        pinyinBuffer.value = "";
        hanziCandidates.value = [];

        await nextTick();
        if (current !== session || !props.visible) return;
        const canvas = canvasRef.value as HTMLCanvasElement | null;
        if (!canvas) return;
        await handlers.initCanvas();
        if (current !== session || !props.visible) return;
        // Keep the bitmap and undo history intact as CSS layout changes.
        // Only initialize if the canvas was initially hidden or zero-sized.
        observer = new ResizeObserver(() => {
            if (props.visible && inputMode.value === 'draw' && !ctx.value) void handlers.initCanvas();
        });
        observer.observe(canvas);
    }, { immediate: true });

    watch(keyboardInputText, (value) => {
        if (props.visible && inputMode.value === 'keyboard') wordText.value = value;
    });
    watch(canvasBackground, () => {
        if (props.visible) handlers.handleBackgroundChange();
    });

    const keydown = (event: KeyboardEvent) => {
        if (!props.visible) return;
        if (touchpadMode.value && inputMode.value === 'draw' &&
            !event.isComposing && !event.ctrlKey && !event.altKey && !event.metaKey &&
            !(event.target instanceof HTMLElement && (event.target.matches('input,textarea,select,[role="textbox"]') || event.target.isContentEditable))) {
            if (event.code === 'Space') {
                event.preventDefault();
                if (!event.repeat) handlers.toggleTouchpadStroke();
                return;
            }
            if (event.key === 'Escape') { handlers.pauseTouchpad(); return; }
        }
        handlers.handlePhysicalKeyDown(event);
    };
    const blur = () => { handlers.pauseTouchpad(); if (isDrawing.value) handlers.stopDrawing(); };
    onMounted(() => {
        themeObserver = new MutationObserver(() => {
            if (props.visible) handlers.syncDrawingTheme(document.documentElement.classList.contains('dark'));
        });
        themeObserver.observe(document.documentElement, {attributes:true, attributeFilter:['class']});
        window.addEventListener('keydown', keydown);
        window.addEventListener('blur', blur);
    });
    onUnmounted(() => {
        ++session;
        observer?.disconnect();
        themeObserver?.disconnect();
        handlers.resetRecognition();
        window.removeEventListener('keydown', keydown);
        window.removeEventListener('blur', blur);
    });
}
