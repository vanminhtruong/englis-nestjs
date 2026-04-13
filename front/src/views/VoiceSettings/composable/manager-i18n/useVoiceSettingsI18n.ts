import { useI18n } from "vue-i18n";
import en from "../../language/en";
import vi from "../../language/vi";
import ko from "../../language/ko";
import zhCN from "../../language/zh-CN";

export function useVoiceSettingsI18n() {
  const { t, mergeLocaleMessage } = useI18n();

  mergeLocaleMessage("en", { voiceSettings: en });
  mergeLocaleMessage("vi", { voiceSettings: vi });
  mergeLocaleMessage("ko", { voiceSettings: ko });
  mergeLocaleMessage("zh-CN", { voiceSettings: zhCN });

  return { t };
}
