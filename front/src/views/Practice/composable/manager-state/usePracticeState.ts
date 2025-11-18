import { ref, reactive, computed } from 'vue'
import type { PracticeSession, PracticeQuestion, PracticeMode, DateOption } from '../../interface/practice.interface'
import type { PracticeMode as PracticeModeEntity } from '../../service/practice.service'

export function usePracticeState() {
  const isStarted = ref(false)
  const showPractice = ref(false)
  const showAnswer = ref(false)
  const userAnswer = ref('')
  const currentQuestionStartTime = ref(0)
  const timeLeft = ref(30)
  const timerInterval = ref<any>(null)
  const showWrongAnswerModal = ref(false)
  const hasAnsweredQuestion = ref(false)
  const answerEffectType = ref<'correct' | 'wrong' | null>(null)
  const answerEffectKey = ref(0)
  const showDateSelection = ref(false)
  const showTimeoutModal = ref(false)
  const availableDates = ref<DateOption[]>([])
  const selectedDate = ref<string | null>(null)
  const loadingDates = ref(false)
  const practiceModes = ref<PracticeModeEntity[]>([])
  const loadingModes = ref(true) // Start with loading true
  const modesLoaded = ref(false) // Track if we've attempted to load
  const loadingPracticeData = ref(false) // Loading vocabulary for practice

  const session = reactive<PracticeSession>({
    mode: 'flashcard',
    questions: [],
    currentIndex: 0,
    answers: new Map(),
    startTime: 0,
  })

  const currentQuestion = computed(() => {
    return session.questions[session.currentIndex] || null
  })

  const progress = computed(() => {
    if (session.questions.length === 0) return 0
    return Math.round(((session.currentIndex + 1) / session.questions.length) * 100)
  })

  const isLastQuestion = computed(() => {
    return session.currentIndex >= session.questions.length - 1
  })

  const totalCorrect = computed(() => {
    let count = 0
    session.answers.forEach((value) => {
      if (value.isCorrect) count++
    })
    return count
  })

  const totalScore = computed(() => {
    let score = 0
    session.answers.forEach((value) => {
      if (value.isCorrect) score += 10
    })
    return score
  })

  function startSession(mode: PracticeMode, questions: PracticeQuestion[]) {
    session.mode = mode
    session.questions = questions
    session.currentIndex = 0
    session.answers.clear()
    session.startTime = Date.now()
    currentQuestionStartTime.value = Date.now()
    isStarted.value = true
    showPractice.value = false
    showAnswer.value = false
    userAnswer.value = ''
    answerEffectType.value = null
    answerEffectKey.value = 0
  }

  function nextQuestion() {
    if (!isLastQuestion.value) {
      session.currentIndex++
      showAnswer.value = false
      userAnswer.value = ''
      currentQuestionStartTime.value = Date.now()
      timeLeft.value = 30
      hasAnsweredQuestion.value = false
      showWrongAnswerModal.value = false
      showTimeoutModal.value = false
    }
  }

  function resetSession() {
    isStarted.value = false
    showPractice.value = false
    showAnswer.value = false
    userAnswer.value = ''
    session.questions = []
    session.currentIndex = 0
    session.answers.clear()
    timeLeft.value = 30
    hasAnsweredQuestion.value = false
    showWrongAnswerModal.value = false
    showTimeoutModal.value = false
     answerEffectType.value = null
     answerEffectKey.value = 0
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  }

  function startTimer() {
    timeLeft.value = 30
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
    timerInterval.value = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        clearInterval(timerInterval.value)
        hasAnsweredQuestion.value = true
        
        // Record as incorrect answer
        const question = session.questions[session.currentIndex]
        if (question) {
          session.answers.set(question.vocabularyId, {
            answer: userAnswer.value || '',
            isCorrect: false,
            timeSpent: 30
          })
        }
        
        // For image_guess mode, show timeout modal instead of auto-next
        if (session.mode === 'image_guess') {
          showTimeoutModal.value = true
        } else {
          // For other modes, just show answer
          showAnswer.value = true
        }
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  }

  return {
    isStarted,
    showPractice,
    showAnswer,
    userAnswer,
    currentQuestionStartTime,
    timeLeft,
    timerInterval,
    showWrongAnswerModal,
    hasAnsweredQuestion,
    answerEffectType,
    answerEffectKey,
    showDateSelection,
    availableDates,
    selectedDate,
    loadingDates,
    practiceModes,
    loadingModes,
    modesLoaded,
    loadingPracticeData,
    showTimeoutModal,
    session,
    currentQuestion,
    progress,
    isLastQuestion,
    totalCorrect,
    totalScore,
    startSession,
    nextQuestion,
    resetSession,
    startTimer,
    stopTimer,
  }
}
