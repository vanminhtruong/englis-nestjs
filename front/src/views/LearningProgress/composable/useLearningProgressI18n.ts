import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
import { useLanguage } from '../../../composables/useLanguage'
import viMessages from '../language/vi'
import enMessages from '../language/en'
import koMessages from '../language/ko'
import zhCNMessages from '../language/zh-CN'

export function useLearningProgressI18n() {
    const { locale, mergeLocaleMessage } = useI18n()
    const { locale: currentLocale } = useLanguage()

    // Merge messages for all locales
    mergeLocaleMessage('vi', { learningProgress: viMessages })
    mergeLocaleMessage('en', { learningProgress: enMessages })
    mergeLocaleMessage('ko', { learningProgress: koMessages })
    mergeLocaleMessage('zh-CN', { learningProgress: zhCNMessages })

    // Watch for locale changes
    watch(currentLocale, () => {
        mergeLocaleMessage('vi', { learningProgress: viMessages })
        mergeLocaleMessage('en', { learningProgress: enMessages })
        mergeLocaleMessage('ko', { learningProgress: koMessages })
        mergeLocaleMessage('zh-CN', { learningProgress: zhCNMessages })
    })

    return { locale }
}

