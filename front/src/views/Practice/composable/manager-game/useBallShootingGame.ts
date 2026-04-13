import { ref, computed, watch, type ComputedRef } from "vue";
import { practiceService } from "../../service/practice.service";

export function useBallShootingGame(session: ComputedRef<any>) {
  const ballShootingQuestions = ref<any[]>([]);

  const isBallShootingMode = computed(() => {
    return session.value.mode === "ball_shooting";
  });

  // Watch for ball_shooting mode selection
  watch(
    () => session.value.mode,
    async (newMode) => {
      if (
        newMode === "ball_shooting" &&
        session.value.questions.length > 0
      ) {
        ballShootingQuestions.value = session.value.questions.map(
          (q: any) => ({
            vocabularyId: q.vocabularyId,
            word: q.word,
            pronunciation: q.pronunciation,
            meaning: q.meaning,
            example: q.example,
            image: q.image,
          })
        );
      }
    },
    { immediate: true }
  );

  // Handle Ball Shooting game completion
  async function handleBallShootingComplete(results: any) {
    console.log("Ball Shooting completed:", results);

    // Submit results to backend for each answered question
    for (const result of results.results) {
      try {
        await practiceService.submitPractice({
          vocabularyId: result.vocabularyId,
          practiceType: "ball_shooting",
          isCorrect: result.isCorrect,
          userAnswer: result.word,
          timeSpent: Math.round(result.timeSpent),
          score: result.isCorrect ? Math.round(100 * result.comboMultiplier) : 0,
          questionStartTime: Date.now() - result.timeSpent * 1000,
        });
      } catch (error) {
        console.error("Failed to submit ball shooting result:", error);
      }
    }
  }

  return {
    ballShootingQuestions,
    isBallShootingMode,
    handleBallShootingComplete,
  };
}
