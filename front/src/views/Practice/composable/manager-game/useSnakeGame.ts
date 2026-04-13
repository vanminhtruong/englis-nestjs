import { ref, computed, watch, type ComputedRef } from "vue";
import { practiceService } from "../../service/practice.service";

export function useSnakeGame(session: ComputedRef<any>) {
  const snakeQuestions = ref<any[]>([]);

  const isSnakeMode = computed(() => {
    return session.value.mode === "snake";
  });

  watch(
    () => session.value.mode,
    async (newMode) => {
      if (newMode === "snake" && session.value.questions.length > 0) {
        snakeQuestions.value = session.value.questions.map((q: any) => ({
          vocabularyId: q.vocabularyId,
          word: q.word,
          pronunciation: q.pronunciation,
          meaning: q.meaning,
          example: q.example,
          image: q.image,
        }));
      }
    },
    { immediate: true }
  );

  async function handleSnakeComplete(results: any) {
    console.log("Snake Game completed:", results);

    // Submit results
    for (const result of results.results) {
      try {
        await practiceService.submitPractice({
          vocabularyId: result.vocabularyId,
          practiceType: "snake", // Use 'snake' as practiceType
          isCorrect: result.isCorrect,
          userAnswer: result.isCorrect ? "Correct" : "Incorrect", // Or meaningful answer if available
          timeSpent: Math.round(result.timeSpent),
          score: result.score,
          questionStartTime: Date.now() - result.timeSpent * 1000,
        });
      } catch (error) {
        console.error("Failed to submit snake result:", error);
      }
    }
  }

  return {
    snakeQuestions,
    isSnakeMode,
    handleSnakeComplete,
  };
}
