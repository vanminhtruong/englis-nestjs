import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

export function useLanguage() {
  const { locale, t } = useI18n()

  const currentLocale = computed({
    get: () => locale.value,
    set: (value) => {
      locale.value = value
      localStorage.setItem('locale', value)
    },
  })

  const availableLocales = [
    { code: 'vi', name: 'Tiếng Việt', flagClass: 'fi fi-vn' },
    { code: 'en', name: 'English', flagClass: 'fi fi-us' },
    { code: 'ko', name: '한국어', flagClass: 'fi fi-kr' },
    { code: 'zh-CN', name: '简体中文', flagClass: 'fi fi-cn' },
  ]

  const setLocale = (code: string) => {
    currentLocale.value = code
  }



  return {
    t,
    locale: currentLocale,
    availableLocales,
    setLocale,
  }
}
