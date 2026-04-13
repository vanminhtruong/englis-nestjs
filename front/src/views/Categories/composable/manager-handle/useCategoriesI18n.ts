import { useI18n } from 'vue-i18n'
import enLang from '../../language/en'
import viLang from '../../language/vi'
import koLang from '../../language/ko'
import zhCNLang from '../../language/zh-CN'

export function useCategoriesI18n() {
  const i18n = useI18n()

  i18n.mergeLocaleMessage('en', { categories: enLang })
  i18n.mergeLocaleMessage('vi', { categories: viLang })
  i18n.mergeLocaleMessage('ko', { categories: koLang })
  i18n.mergeLocaleMessage('zh-CN', { categories: zhCNLang })

  return {
    i18n,
  }
}
