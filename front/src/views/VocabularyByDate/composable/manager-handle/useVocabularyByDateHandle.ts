import { vocabularyByDateService } from "../../service/vocabulary-by-date.service";
import { type Ref, computed, ref, watch } from "vue";
import type {
  VocabularyByDate,
  CategoryGroup,
  CategoryInfo,
  VocabularyItem,
} from "../../interface/vocabulary-by-date.interface";

type RawDateGroup = Omit<VocabularyByDate, "categories"> & { vocabularies: VocabularyItem[] };
import { useI18n } from "vue-i18n";
import { getPreferredVoice } from "../../../../composables/usePreferredVoice";

export function useVocabularyByDateHandle(
  vocabulariesByDate: Ref<VocabularyByDate[]>,
  loading: Ref<boolean>,
  searchQuery: Ref<string>,
  expandedDates: Ref<Set<string>>,
  expandedCategories: Ref<Set<string>>,
  expandAll: Ref<boolean>,
) {
  const { locale } = useI18n();
  async function loadData() {
    loading.value = true;
    try {
      const result = await vocabularyByDateService.loadVocabulariesByDate();
      if (result.success && result.data) {
        const rawData = result.data as unknown as RawDateGroup[];
        const processedData = rawData.map((dateGroup) => {
          const categoriesMap = new Map<string, CategoryGroup>();

          dateGroup.vocabularies.forEach((vocab) => {
            const category: CategoryInfo = (vocab.categories?.[0] as CategoryInfo | undefined) ?? {
              id: "uncategorized",
              name: "Uncategorized",
              icon: "default",
              color: "#808080",
            };

            if (!categoriesMap.has(category.id)) {
              categoriesMap.set(category.id, {
                category: category,
                vocabularies: [],
              });
            }
            categoriesMap.get(category.id)!.vocabularies.push(vocab);
          });

          return {
            date: dateGroup.date,
            count: dateGroup.count,
            topic: dateGroup.topic,
            icon: dateGroup.icon,
            color: dateGroup.color,
            categories: Array.from(categoriesMap.values()),
          };
        });
        vocabulariesByDate.value = processedData;
      } else {
        console.error("Failed to load vocabularies:", result.error || "Unknown error");
        // Hiển thị empty array thay vì để undefined
        vocabulariesByDate.value = [];
      }
    } catch (error: unknown) {
      console.error("Error loading vocabularies:", error instanceof Error ? error.message : error);
      vocabulariesByDate.value = [];
    } finally {
      loading.value = false;
    }
  }

  function handleSpeak(word: string) {
    if (!("speechSynthesis" in window)) {
      console.warn("Text-to-speech not supported");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(word);
    const voice = getPreferredVoice("en-US");
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const localeMap: Record<string, string> = {
      en: "en-US",
      vi: "vi-VN",
      ko: "ko-KR",
    };
    return date.toLocaleDateString(localeMap[locale.value] || "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case "easy":
        return "text-green-500 dark:text-green-400";
      case "medium":
        return "text-yellow-500 dark:text-yellow-400";
      case "hard":
        return "text-red-500 dark:text-red-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  }

  const filteredVocabularies = computed(() => {
    if (!searchQuery.value.trim()) {
      return vocabulariesByDate.value;
    }
    const query = searchQuery.value.toLowerCase();
    return vocabulariesByDate.value
      .map((dateGroup) => {
        const filteredCategories = dateGroup.categories
          .map((catGroup) => ({
            ...catGroup,
            vocabularies: catGroup.vocabularies.filter(
              (vocab) =>
                vocab.word.toLowerCase().includes(query) ||
                vocab.meaning.toLowerCase().includes(query) ||
                vocab.pronunciation.toLowerCase().includes(query),
            ),
          }))
          .filter((catGroup) => catGroup.vocabularies.length > 0);
        return {
          ...dateGroup,
          categories: filteredCategories,
        };
      })
      .filter((dateGroup) => dateGroup.categories.length > 0);
  });

  // Paginate *date groups*, not the vocabulary inside a date.
  // Always paginate after search so the result count and page labels stay accurate.
  const DATE_GROUPS_PER_PAGE = 5;
  const currentPage = ref(1);
  const pageCount = computed(() =>
    Math.ceil(filteredVocabularies.value.length / DATE_GROUPS_PER_PAGE),
  );
  const paginatedVocabularies = computed(() => {
    const offset = (currentPage.value - 1) * DATE_GROUPS_PER_PAGE;
    return filteredVocabularies.value.slice(offset, offset + DATE_GROUPS_PER_PAGE);
  });
  const rangeStart = computed(() =>
    filteredVocabularies.value.length ? (currentPage.value - 1) * DATE_GROUPS_PER_PAGE + 1 : 0,
  );
  const rangeEnd = computed(() =>
    Math.min(currentPage.value * DATE_GROUPS_PER_PAGE, filteredVocabularies.value.length),
  );

  function changePage(page: number) {
    if (!Number.isInteger(page)) return;
    currentPage.value = Math.min(Math.max(1, page), Math.max(1, pageCount.value));
  }

  // A new search starts at page 1. When refreshed data contains fewer groups,
  // clamp the active page instead of rendering an empty page.
  watch(searchQuery, () => {
    currentPage.value = 1;
  });
  watch(
    () => filteredVocabularies.value.length,
    () => {
      if (currentPage.value > Math.max(1, pageCount.value)) {
        currentPage.value = Math.max(1, pageCount.value);
      }
    },
  );

  function toggleDate(date: string) {
    if (expandedDates.value.has(date)) {
      expandedDates.value.delete(date);
    } else {
      expandedDates.value.add(date);
    }
  }

  function toggleExpandAll() {
    expandAll.value = !expandAll.value;
    if (expandAll.value) {
      vocabulariesByDate.value.forEach((group) => {
        expandedDates.value.add(group.date);
      });
    } else {
      expandedDates.value.clear();
    }
  }

  function isDateExpanded(date: string): boolean {
    return expandedDates.value.has(date);
  }

  function toggleCategory(date: string, categoryId: string) {
    const key = `${date}-${categoryId}`;
    if (expandedCategories.value.has(key)) {
      expandedCategories.value.delete(key);
    } else {
      expandedCategories.value.add(key);
    }
  }

  function isCategoryExpanded(date: string, categoryId: string): boolean {
    return expandedCategories.value.has(`${date}-${categoryId}`);
  }

  async function moveCategoryToDate(fromDate: string, toDate: string, categoryId: string) {
    if (!toDate || !categoryId || !fromDate) return;
    const result = await vocabularyByDateService.moveCategoryByDate({
      fromDate,
      toDate,
      categoryId,
    });
    if (result.success) {
      await loadData();
    } else {
      console.error("Failed to move vocabularies:", result.error);
    }
  }

  async function updateTopic(date: string, topic: string, icon?: string, color?: string) {
    if (!date) return;
    const result = await vocabularyByDateService.updateCategoryTopic({ date, topic, icon, color });
    if (result.success) {
      const groupInState = vocabulariesByDate.value.find((g) => g.date === date);
      if (groupInState) {
        groupInState.topic = topic;
        if (icon !== undefined) groupInState.icon = icon;
        if (color !== undefined) groupInState.color = color;
      }
    } else {
      console.error("Failed to update topic:", result.error);
    }
  }

  return {
    loadData,
    handleSpeak,
    formatDate,
    getDifficultyColor,
    filteredVocabularies,
    paginatedVocabularies,
    currentPage,
    pageCount,
    rangeStart,
    rangeEnd,
    changePage,
    toggleDate,
    toggleExpandAll,
    isDateExpanded,
    toggleCategory,
    isCategoryExpanded,
    moveCategoryToDate,
    updateTopic,
  };
}
