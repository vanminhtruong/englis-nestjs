import apiService from "../../services/api.service";
import { dataShareMessages } from "./language";

export interface IncomingShare {
  id: string;
  sender: { id: string; fullName: string; email: string };
  vocabularyCount: number;
  historyCount: number;
  createdAt: string;
}

export interface ShareMergeStats {
  newVocabularies: number;
  skippedVocabularies: number;
  newHistories: number;
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
