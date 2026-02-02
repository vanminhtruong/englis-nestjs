import { createI18n } from 'vue-i18n'

// Layout & Common
import layoutEn from './locales/en'
import layoutVi from './locales/vi'
import layoutKo from './locales/ko'
import layoutZhCN from './locales/zh-CN'

// Views
import loginEn from '../views/Login/language/en'
import loginVi from '../views/Login/language/vi'
import loginKo from '../views/Login/language/ko'
import loginZhCN from '../views/Login/language/zh-CN'

import registerEn from '../views/Register/language/en'
import registerVi from '../views/Register/language/vi'
import registerKo from '../views/Register/language/ko'
import registerZhCN from '../views/Register/language/zh-CN'

import vocabularyEn from '../views/Vocabulary/language/en'
import vocabularyVi from '../views/Vocabulary/language/vi'
import vocabularyKo from '../views/Vocabulary/language/ko'
import vocabularyZhCN from '../views/Vocabulary/language/zh-CN'

import vocabularyByDateEn from '../views/VocabularyByDate/language/en'
import vocabularyByDateVi from '../views/VocabularyByDate/language/vi'
import vocabularyByDateKo from '../views/VocabularyByDate/language/ko'
import vocabularyByDateZhCN from '../views/VocabularyByDate/language/zh-CN'

import practiceEn from '../views/Practice/language/en'
import practiceVi from '../views/Practice/language/vi'
import practiceKo from '../views/Practice/language/ko'
import practiceZhCN from '../views/Practice/language/zh-CN'

import historyEn from '../views/History/language/en'
import historyVi from '../views/History/language/vi'
import historyKo from '../views/History/language/ko'
import historyZhCN from '../views/History/language/zh-CN'

import homeEn from '../views/Home/language/en'
import homeVi from '../views/Home/language/vi'
import homeKo from '../views/Home/language/ko'
import homeZhCN from '../views/Home/language/zh-CN'

import aboutEn from '../views/About/language/en'
import aboutVi from '../views/About/language/vi'
import aboutKo from '../views/About/language/ko'
import aboutZhCN from '../views/About/language/zh-CN'

const getInitialLocale = () => {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && ['vi', 'en', 'ko', 'zh-CN'].includes(savedLocale)) {
    return savedLocale
  }
  return 'vi'
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en: {
      ...layoutEn,
      login: loginEn,
      register: registerEn,
      home: homeEn,
      about: aboutEn,
      vocabulary: vocabularyEn,
      vocabularyByDate: vocabularyByDateEn,
      practice: practiceEn,
      history: historyEn,
    },
    vi: {
      ...layoutVi,
      login: loginVi,
      register: registerVi,
      home: homeVi,
      about: aboutVi,
      vocabulary: vocabularyVi,
      vocabularyByDate: vocabularyByDateVi,
      practice: practiceVi,
      history: historyVi,
    },
    ko: {
      ...layoutKo,
      login: loginKo,
      register: registerKo,
      home: homeKo,
      about: aboutKo,
      vocabulary: vocabularyKo,
      vocabularyByDate: vocabularyByDateKo,
      practice: practiceKo,
      history: historyKo,
    },
    'zh-CN': {
      ...layoutZhCN,
      login: loginZhCN,
      register: registerZhCN,
      home: homeZhCN,
      about: aboutZhCN,
      vocabulary: vocabularyZhCN,
      vocabularyByDate: vocabularyByDateZhCN,
      practice: practiceZhCN,
      history: historyZhCN,
    },
  },
})

export default i18n
