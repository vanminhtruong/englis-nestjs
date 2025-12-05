export default {
  title: '프로필',
  subtitle: '개인 정보와 환경 설정을 관리하세요',
  exportData: '데이터 내보내기',
  importData: '데이터 가져오기',
  sections: {
    overview: '개요',
    accountInfo: '계정 정보',
    appearance: '테마 설정',
  },
  fields: {
    fullName: '이름',
    email: '이메일',
    avatar: '아바타 URL',
    theme: '테마',
  },
  stats: {
    totalScore: '총 점수',
    totalWords: '총 단어 수',
    memberSince: '가입일',
    lastUpdated: '마지막 업데이트',
  },
  actions: {
    saveChanges: '변경 내용 저장',
    cancel: '취소',
  },
  messages: {
    updateSuccess: '프로필이 성공적으로 업데이트되었습니다',
    updateError: '프로필 업데이트에 실패했습니다',
    exportSuccess: '데이터 내보내기 성공',
    exportError: '데이터 내보내기 실패',
    importSuccess: '데이터 가져오기 성공',
    importError: '데이터 가져오기 실패',
    importNoChanges: '이 데이터는 이미 존재합니다',
    importStats: '{new}개의 새 단어 추가, {updated}개 업데이트, {skipped}개 중복 건너뜀',
  },
}
