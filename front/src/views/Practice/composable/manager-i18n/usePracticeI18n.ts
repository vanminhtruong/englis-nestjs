import { useI18n } from "vue-i18n";
import enLang from "../../language/en";
import viLang from "../../language/vi";
import koLang from "../../language/ko";
import zhCNLang from "../../language/zh-CN";

export function usePracticeI18n() {
  const { t, mergeLocaleMessage } = useI18n();

  // Register language cho practice view
  mergeLocaleMessage("en", { practice: enLang });
  mergeLocaleMessage("vi", { practice: viLang });
  mergeLocaleMessage("ko", { practice: koLang });
  mergeLocaleMessage("zh-CN", { practice: zhCNLang });

  return { t };
}
