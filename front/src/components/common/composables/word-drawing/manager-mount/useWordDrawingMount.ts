
import { watch, onMounted, onUnmounted, nextTick } from "vue";

export function useWordDrawingMount(
    state: any,
    handlers: any,
    props: { visible: boolean; word: string }
) {
    const {
        hasDrawn,
        history,
        historyIndex,
        previewDataUrl,
        wordText,
        inputMode,
        keyboardInputText,
        isShift,
        selectedTone,
        pinyinBuffer,
        hanziCandidates,
        canvasBackground,
        canvasRef,
        ctx,
    } = state;

    const { initCanvas, handleBackgroundChange } = handlers;
    let resizeObserver: ResizeObserver | null = null;

    // Reset state when modal opens
    watch(
        () => props.visible,
        async (visible) => {
            if (visible) {
                // Reset drawing state
                hasDrawn.value = false;
                history.value = [];
                historyIndex.value = -1;
                previewDataUrl.value = "";
                wordText.value = props.word || "";

                // Reset keyboard state
                inputMode.value = "draw";
                keyboardInputText.value = "";
                isShift.value = false;
                selectedTone.value = 0;
                pinyinBuffer.value = "";
                hanziCandidates.value = [];

                await nextTick();
                initCanvas();
            }
        }
    );

    // Watch background changes
    watch(canvasBackground, () => {
        handleBackgroundChange();
    });

    onMounted(() => {
        if (typeof ResizeObserver === 'undefined') return;

        resizeObserver = new ResizeObserver(() => {
            // Logic for resize
            if (props.visible && canvasRef.value) {
                let currentState: ImageData | undefined;

                if (ctx.value) {
                    try {
                        currentState = ctx.value.getImageData(
                            0,
                            0,
                            canvasRef.value.width,
                            canvasRef.value.height
                        );
                    } catch (e) {
                        console.warn("Could not get image data on resize", e);
                    }
                }

                initCanvas();

                if (currentState && ctx.value) {
                    ctx.value.putImageData(currentState, 0, 0);
                }
            }
        });

        // Observe body for layout changes
        resizeObserver.observe(document.body);

        window.addEventListener("keydown", handlers.handlePhysicalKeyDown);
    });

    onUnmounted(() => {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
        window.removeEventListener("keydown", handlers.handlePhysicalKeyDown);
    });
}
