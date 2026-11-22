import { computed, ref, type Ref } from "vue";
import { apiClient } from "../../../services/api.service";
import type { SrsCard, SrsOverview, SrsRating, SrsReviewResult } from "../types";

export type SrsPhase = "overview" | "loading" | "review" | "complete" | "error";

export function useSrs(selectedTabId: Ref<string | null>) {
  const phase = ref<SrsPhase>("overview");
  const overview = ref<SrsOverview | null>(null);
  const overviewLoading = ref(true);
  const queue = ref<SrsCard[]>([]);
  const index = ref(0);
  const revealed = ref(false);
  const hintVisible = ref(false);
  const submitting = ref(false);
  const error = ref("");
  const sessionCount = ref(0);
  // Self-practice uses the same flashcards without advancing scheduled SRS reviews.
  const sessionIncludesScheduled = ref(false);
  const sessionRatings = ref<Record<SrsRating, number>>({ again: 0, hard: 0, good: 0, easy: 0 });
  const lastResult = ref<SrsReviewResult | null>(null);
  let overviewRequest = 0;

  const tabParams = () => (selectedTabId.value ? { tabId: selectedTabId.value } : {});

  const currentCard = computed(() => queue.value[index.value] ?? null);
  const progressPercent = computed(() =>
    sessionCount.value ? Math.round((index.value / sessionCount.value) * 100) : 0,
  );

  async function refreshOverview() {
    const request = ++overviewRequest;
    overviewLoading.value = true;
    try {
      const { data } = await apiClient.get<SrsOverview>("/srs/overview", {
        params: tabParams(),
      });
      if (request === overviewRequest) {
        overview.value = data;
        if (error.value === "overview") error.value = "";
      }
      return request === overviewRequest;
    } catch {
      if (request === overviewRequest) error.value = "overview";
      return false;
    } finally {
      if (request === overviewRequest) overviewLoading.value = false;
    }
  }

  async function start(limit: number, includeScheduled = false) {
    sessionIncludesScheduled.value = includeScheduled;
    phase.value = "loading";
    error.value = "";
    try {
      const { data } = await apiClient.get<SrsCard[]>("/srs/queue", {
        params: { limit, ...tabParams(), ...(includeScheduled ? { includeScheduled: true } : {}) },
      });
      queue.value = data;
      index.value = 0;
      sessionCount.value = data.length;
      sessionRatings.value = { again: 0, hard: 0, good: 0, easy: 0 };
      revealed.value = false;
      hintVisible.value = false;
      lastResult.value = null;
      phase.value = data.length ? "review" : "complete";
    } catch {
      error.value = "queue";
      phase.value = "error";
    }
  }

  function reveal() {
    revealed.value = true;
    hintVisible.value = false;
  }

  async function rate(rating: SrsRating) {
    if (!currentCard.value || !revealed.value || submitting.value) return;
    submitting.value = true;
    error.value = "";
    try {
      // These cards are scheduled for the future. Local practice must not
      // overwrite their due date or create an official SRS review record.
      if (currentCard.value.isPracticeOnly) {
        sessionRatings.value[rating] += 1;
        index.value += 1;
        revealed.value = false;
        hintVisible.value = false;
        if (index.value >= queue.value.length) {
          phase.value = "complete";
          await refreshOverview();
        }
        return;
      }
      const { data } = await apiClient.post<SrsReviewResult>(
        `/srs/${encodeURIComponent(currentCard.value.id)}/review`,
        { rating },
      );
      lastResult.value = data;
      sessionRatings.value[rating] += 1;
      index.value += 1;
      revealed.value = false;
      hintVisible.value = false;
      if (index.value >= queue.value.length) {
        phase.value = "complete";
        await refreshOverview();
      }
    } catch {
      error.value = "review";
    } finally {
      submitting.value = false;
    }
  }

  function changeTab() {
    // Prevent displaying overview values from the previously selected tab.
    overview.value = null;
    void refreshOverview();
  }

  function leave() {
    if (submitting.value) return;
    phase.value = "overview";
    queue.value = [];
    sessionIncludesScheduled.value = false;
    index.value = 0;
    revealed.value = false;
    hintVisible.value = false;
    error.value = "";
    void refreshOverview();
  }

  return {
    phase,
    overview,
    overviewLoading,
    queue,
    currentCard,
    index,
    revealed,
    hintVisible,
    submitting,
    error,
    sessionCount,
    sessionIncludesScheduled,
    sessionRatings,
    lastResult,
    progressPercent,
    refreshOverview,
    changeTab,
    start,
    reveal,
    rate,
    leave,
  };
}
