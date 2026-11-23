import apiService from "../../services/api.service";
import { dataShareMessages } from "./language";

/** How much besides words and practice history an offer carries. */
export interface ShareSummary {
  categories: number;
  tags: number;
  dateTopics: number;
  tabs: number;
  srs: number;
}

export interface IncomingShare {
  id: string;
  sender: { id: string; fullName: string; email: string };
  vocabularyCount: number;
  historyCount: number;
  /** Missing on offers sent before categories, tags and Smart review were included. */
  summary?: ShareSummary | null;
  createdAt: string;
}

/** What a merge (accepting an offer or importing a file) really changed. */
export interface ShareMergeStats {
  newVocabularies: number;
  updatedVocabularies?: number;
  skippedVocabularies: number;
  newHistories: number;
  newCategories?: number;
  newTags?: number;
  newDateTopics?: number;
  newTabs?: number;
  newSrsProgress?: number;
  newSrsReviews?: number;
  linkedWords?: number;
  updatedOthers?: number;
}

/** "5 categories, 3 tags, ..." for the offer; empty when there is nothing extra. */
export function describeSummary(
  summary: ShareSummary | null | undefined,
  t: (key: string, params?: Record<string, unknown>) => string,
): string {
  if (!summary) return "";
  const parts: string[] = [];
  if (summary.categories > 0) parts.push(t("dataShare.parts.categories", { count: summary.categories }));
  if (summary.tags > 0) parts.push(t("dataShare.parts.tags", { count: summary.tags }));
  if (summary.dateTopics > 0) parts.push(t("dataShare.parts.dateTopics", { count: summary.dateTopics }));
  if (summary.tabs > 0) parts.push(t("dataShare.parts.tabs", { count: summary.tabs }));
  if (summary.srs > 0) parts.push(t("dataShare.parts.srs", { count: summary.srs }));
  return parts.join(", ");
}

/** What was added by a merge, beyond the words themselves. */
export function describeMergeExtras(
  stats: ShareMergeStats | undefined,
  t: (key: string, params?: Record<string, unknown>) => string,
): string {
  if (!stats) return "";
  const parts: string[] = [];
  if ((stats.newHistories ?? 0) > 0) parts.push(t("dataShare.parts.histories", { count: stats.newHistories }));
  if ((stats.newCategories ?? 0) > 0) parts.push(t("dataShare.parts.categories", { count: stats.newCategories }));
  if ((stats.newTags ?? 0) > 0) parts.push(t("dataShare.parts.tags", { count: stats.newTags }));
  if ((stats.newDateTopics ?? 0) > 0) parts.push(t("dataShare.parts.dateTopics", { count: stats.newDateTopics }));
  if ((stats.newTabs ?? 0) > 0) parts.push(t("dataShare.parts.tabs", { count: stats.newTabs }));
  if ((stats.newSrsProgress ?? 0) > 0) parts.push(t("dataShare.parts.srs", { count: stats.newSrsProgress }));
  return parts.join(", ");
}

/** Adds the data-sharing messages to vue-i18n (safe to call many times). */
export function registerDataShareMessages(
  mergeLocaleMessage: (locale: string, message: any) => void,
) {
  Object.entries(dataShareMessages).forEach(([locale, messages]) => {
    mergeLocaleMessage(locale, { dataShare: messages });
  });
}

type Translate = (key: string, params?: Record<string, unknown>) => string;
type KeyExists = (key: string) => boolean;

/** Turns an API error into a message the person can read in their language. */
export function shareErrorMessage(error: any, t: Translate, te: KeyExists): string {
  const raw = error?.response?.data?.message;
  const text = Array.isArray(raw) ? raw.join(" ") : raw;

  if (typeof text === "string") {
    if (/^[A-Z_]+$/.test(text) && te(`dataShare.errors.${text}`)) {
      return t(`dataShare.errors.${text}`);
    }
    // class-validator reports a bad email as "email must be an email"
    if (/email/i.test(text)) return t("dataShare.invalidEmail");
  }
  return t("dataShare.errors.generic");
}

/** Error codes meaning the offer is gone, so it must leave the dialog queue. */
export function isShareGone(error: any): boolean {
  const raw = error?.response?.data?.message;
  return ["SHARE_NOT_FOUND", "SHARE_EXPIRED", "SHARE_ALREADY_HANDLED"].includes(raw);
}

export const dataShareService = {
  async send(email: string) {
    const response = await apiService.dataShare.send(email);
    return response.data as { id: string; recipientEmail: string };
  },
  async getIncoming(): Promise<IncomingShare[]> {
    const response = await apiService.dataShare.getIncoming();
    return Array.isArray(response.data) ? response.data : [];
  },
  async accept(id: string) {
    const response = await apiService.dataShare.accept(id);
    return response.data as { id: string; stats: ShareMergeStats };
  },
  async reject(id: string) {
    await apiService.dataShare.reject(id);
  },
};
