import { practiceService } from '../../service/practice.service'
import type { PracticeMode, PracticeQuestion } from '../../interface/practice.interface'
import { useI18n } from 'vue-i18n'

export function usePracticeHandle(
  startSession: (mode: PracticeMode, questions: PracticeQuestion[]) => void,
  session: any,
  currentQuestion: any,
  userAnswer: any,
  showAnswer: any,
  currentQuestionStartTime: any,
  nextQuestion: () => void,
  isLastQuestion: any,
  startTimer: () => void,
  stopTimer: () => void,
  showWrongAnswerModal: any,
  hasAnsweredQuestion: any,
  resetSession: () => void,
  showPractice?: any,
  showDateSelection?: any,
  availableDates?: any,
  selectedDate?: any,
  loadingDates?: any,
  practiceModes?: any,
  loadingModes?: any,
  modesLoaded?: any,
  loadingPracticeData?: any,
  answerEffectType?: any,
  answerEffectKey?: any,
  showExitConfirmModal?: any,
) {
  const { locale } = useI18n()
  async function handleStartPractice(mode: PracticeMode) {
    if (!loadingPracticeData) return

    console.log('Starting practice with mode:', mode)
    loadingPracticeData.value = true
    try {
      const result = await practiceService.getVocabulariesForPractice(10)
      console.log('Vocabulary API result:', result)

      if (result.success && result.data && result.data.length > 0) {
        const questions: PracticeQuestion[] = result.data.map((v: any) => ({
          vocabularyId: v.id,
          word: v.word,
          pronunciation: v.pronunciation,
          meaning: v.meaning,
          example: v.example,
          image: v.image,
        }))
        console.log('Created questions:', questions.length)
        startSession(mode, questions)
      } else {
        const errorMsg = result.error || 'No vocabulary available for practice. Please add some vocabulary first.'
        console.error('No vocabulary for practice:', errorMsg)
        alert(errorMsg)
      }
    } catch (error) {
      console.error('Error starting practice:', error)
      alert('Failed to load practice data. Please try again.')
    } finally {
      loadingPracticeData.value = false
    }
  }

  async function handleSubmitAnswer() {
    if (!currentQuestion.value || hasAnsweredQuestion.value) return

    const timeSpent = Math.floor((Date.now() - currentQuestionStartTime.value) / 1000)
    const isCorrect = checkAnswer()

    hasAnsweredQuestion.value = true
    stopTimer()

    // Trigger answer effect immediately
    if (answerEffectType && answerEffectKey) {
      answerEffectType.value = isCorrect ? 'correct' : 'wrong'
      answerEffectKey.value++
      console.log('Answer effect triggered:', isCorrect ? 'correct' : 'wrong', 'key:', answerEffectKey.value)
    }

    session.answers.set(currentQuestion.value.vocabularyId, {
      answer: userAnswer.value,
      isCorrect,
      timeSpent,
    })

    const result = await practiceService.submitPractice({
      vocabularyId: currentQuestion.value.vocabularyId,
      practiceType: session.mode,
      isCorrect,
      userAnswer: userAnswer.value,
      timeSpent,
      score: isCorrect ? 10 : 0,
      questionStartTime: currentQuestionStartTime.value,
    })

    // Backend returns the final result after checking time limit
    const finalIsCorrect = result.data?.isCorrect ?? isCorrect

    // Update effect if backend result differs
    if (finalIsCorrect !== isCorrect && answerEffectType && answerEffectKey) {
      answerEffectType.value = finalIsCorrect ? 'correct' : 'wrong'
      answerEffectKey.value++
      console.log('Answer effect updated from backend:', finalIsCorrect ? 'correct' : 'wrong')
    }

    // Không dùng modal cho câu trả lời sai nữa, chỉ hiển thị kết quả inline
    if (showAnswer) {
      showAnswer.value = true
    }
    if (showWrongAnswerModal) {
      showWrongAnswerModal.value = false
    }
  }

  async function handleFlashcardAnswer(isCorrect: boolean) {
    if (!currentQuestion.value) return

    const timeSpent = Math.floor((Date.now() - currentQuestionStartTime.value) / 1000)

    hasAnsweredQuestion.value = true
    stopTimer()

    session.answers.set(currentQuestion.value.vocabularyId, {
      answer: isCorrect ? 'Knew' : 'Didn\'t know',
      isCorrect,
      timeSpent,
    })

    await practiceService.submitPractice({
      vocabularyId: currentQuestion.value.vocabularyId,
      practiceType: session.mode,
      isCorrect,
      userAnswer: isCorrect ? 'Knew' : 'Didn\'t know',
      timeSpent,
      score: isCorrect ? 10 : 0,
      questionStartTime: currentQuestionStartTime.value,
    })

    if (answerEffectType && answerEffectKey) {
      answerEffectType.value = isCorrect ? 'correct' : 'wrong'
      answerEffectKey.value++
    }

    if (!isLastQuestion.value) {
      nextQuestion()
      startTimer()
    }
  }

  async function loadAvailableDates() {
    if (!loadingDates || !availableDates) return

    loadingDates.value = true
    try {
      const result = await practiceService.getAvailableDates()
      if (result.success && result.data) {
        const localeMap: Record<string, string> = {
          en: 'en-US',
          vi: 'vi-VN',
          ko: 'ko-KR',
        }

        availableDates.value = result.data.map((item: any) => ({
          ...item,
          formattedDate: new Date(item.date).toLocaleDateString(localeMap[locale.value] || 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        }))
      } else {
        console.error('Failed to load available dates:', result.error)
        availableDates.value = []
      }
    } catch (error) {
      console.error('Error loading available dates:', error)
      availableDates.value = []
    } finally {
      loadingDates.value = false
    }
  }

  async function handleStartPracticeByDate(mode: PracticeMode, date: string) {
    if (!loadingPracticeData) return

    console.log('Starting practice by date:', date, 'mode:', mode)
    loadingPracticeData.value = true
    try {
      const result = await practiceService.getVocabulariesByDate(date, 10)
      console.log('Vocabulary by date API result:', result)

      if (result.success && result.data && result.data.length > 0) {
        const questions: PracticeQuestion[] = result.data.map((v: any) => ({
          vocabularyId: v.id,
          word: v.word,
          pronunciation: v.pronunciation,
          meaning: v.meaning,
          example: v.example,
          image: v.image,
        }))
        console.log('Created questions for date:', questions.length)
        startSession(mode, questions)
      } else {
        const errorMsg = result.error || `No vocabulary available for ${date}. Please add vocabulary for this date first.`
        console.error('No vocabulary for date:', errorMsg)
        alert(errorMsg)
      }
    } catch (error) {
      console.error('Error starting practice by date:', error)
      alert('Failed to load practice data for selected date. Please try again.')
    } finally {
      loadingPracticeData.value = false
    }
  }

  function normalizeAnswer(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, ' ')
  }

  function checkAnswer(): boolean {
    if (!currentQuestion.value) return false

    // For image_guess mode, compare with word (English), otherwise compare with meaning (Vietnamese)
    const correctRaw = session.mode === 'image_guess'
      ? (currentQuestion.value.word ?? '').toString()
      : (currentQuestion.value.meaning ?? '').toString()
    const userRaw = (userAnswer.value ?? '').toString()

    const correct = normalizeAnswer(correctRaw)
    const user = normalizeAnswer(userRaw)

    if (!user) return false
    return correct === user
  }

  // Practice modes are now hardcoded in usePracticeState.ts
  // This function is kept for compatibility but doesn't do anything
  async function loadPracticeModes() {
    console.log('Practice modes are hardcoded - no API call needed')
    // Modes are already loaded from hardcoded values in usePracticeState
    // No API call required
  }

  function selectMode(mode: "flashcard" | "typing" | "image_guess" | "ball_shooting") {
    handleStartPractice(mode)
  }

  function handleModeClick(mode: any) {
    if (mode.key === "practice_by_date") {
      showDateSelectionMode()
    } else if (mode.key === "ball_shooting") {
      // Ball shooting mode is handled differently in PracticeView
      selectMode("ball_shooting")
    } else {
      selectMode(mode.key as "flashcard" | "typing" | "image_guess")
    }
  }

  function startPracticeSession() {
    if (!showPractice) return
    showPractice.value = true
    showAnswer.value = false
    userAnswer.value = ""
    hasAnsweredQuestion.value = false
    showWrongAnswerModal.value = false
    startTimer()
  }

  function handleNextQuestion() {
    nextQuestion()
    startTimer()
  }

  function handleContinueAfterWrong() {
    showWrongAnswerModal.value = false
    if (!isLastQuestion.value) {
      nextQuestion()
      startTimer()
    } else {
      showAnswer.value = true
    }
  }

  function showDateSelectionMode() {
    if (!showDateSelection) return
    showDateSelection.value = true
    loadAvailableDates()
  }

  function backToModeSelection() {
    resetSession()
    if (showDateSelection) {
      showDateSelection.value = false
    }
    if (selectedDate) {
      selectedDate.value = null
    }
  }

  function selectDate(date: string) {
    if (!selectedDate) return
    selectedDate.value = date
  }

  function startPracticeByDate(mode: "flashcard" | "typing" | "image_guess") {
    if (selectedDate && selectedDate.value) {
      handleStartPracticeByDate(mode, selectedDate.value)
    }
  }

  function onSubmitAnswer(value: string) {
    userAnswer.value = (value ?? "").toString()
    handleSubmitAnswer()
  }

  async function handleConfirmExit() {
    try {
      const answeredQuestions: any[] = []
      session.answers.forEach((answer: any, vocabularyId: string) => {
        answeredQuestions.push({
          vocabularyId,
          isCorrect: answer.isCorrect,
          userAnswer: answer.answer,
          timeSpent: answer.timeSpent,
        })
      })

      if (
        currentQuestion.value &&
        !session.answers.has(currentQuestion.value.vocabularyId)
      ) {
        const timeSpent = Math.round(
          (Date.now() - currentQuestionStartTime.value) / 1000
        )
        answeredQuestions.push({
          vocabularyId: currentQuestion.value.vocabularyId,
          isCorrect: false,
          userAnswer: "",
          timeSpent: Math.max(0, timeSpent),
        })
      }

      console.log("Exiting practice with answers:", answeredQuestions)
      console.log("Practice mode:", session.mode)

      if (answeredQuestions.length > 0) {
        const result = await practiceService.saveIncomplete({
          practiceType: session.mode,
          questions: answeredQuestions,
          totalQuestions: session.questions.length,
          answeredCount: answeredQuestions.length,
          isComplete: false,
        })
        console.log("Save incomplete result:", result)
      } else {
        console.log("No answered questions to save")
      }

      if (showExitConfirmModal) {
        showExitConfirmModal.value = false
      }
      stopTimer()
      backToModeSelection()
    } catch (error) {
      console.error("Error saving incomplete practice:", error)
      if (showExitConfirmModal) {
        showExitConfirmModal.value = false
      }
      stopTimer()
      backToModeSelection()
    }
  }

  return {
    handleStartPractice,
    handleSubmitAnswer,
    handleFlashcardAnswer,
    loadAvailableDates,
    handleStartPracticeByDate,
    loadPracticeModes,
    checkAnswer,
    selectMode,
    handleModeClick,
    startPracticeSession,
    handleNextQuestion,
    handleContinueAfterWrong,
    showDateSelectionMode,
    backToModeSelection,
    selectDate,
    startPracticeByDate,
    onSubmitAnswer,
    handleConfirmExit,
  }
}
