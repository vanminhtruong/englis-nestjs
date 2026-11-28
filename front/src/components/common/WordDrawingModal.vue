<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        data-word-drawer
        role="dialog" aria-modal="true" :aria-label="t('wordDrawing.wordDrawer')"
        class="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-1.5 sm:p-4"
      >
        <div
          data-learning-modal-shell class="flex h-[96dvh] w-full min-w-0 max-w-6xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-black sm:h-[90dvh] sm:rounded-3xl"
        >
          <!-- Header -->
          <div
            class="flex flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4 border-b border-black/5 dark:border-white/10 flex-shrink-0"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="w-10 h-10 shrink-0 rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              </div>
              <div>
                <p class="text-base font-bold leading-tight text-black dark:text-white sm:text-lg">
                  {{ t("wordDrawing.wordDrawer") }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t("wordDrawing.drawYourWord") }}
                </p>
              </div>
            </div>

            <!-- Input Mode Toggle -->
            <div class="order-last w-full sm:order-none sm:w-auto flex items-center justify-center gap-2 sm:mr-4">
              <div class="flex bg-gray-100 dark:bg-white/10 rounded-xl p-1">
                <button
                  type="button" data-drawer-mode="draw" data-seasonal-tab :aria-pressed="state.inputMode === 'draw'" @click="handlers.setMode('draw')"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    state.inputMode === 'draw'
                      ? 'bg-white dark:bg-white/5 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                  ]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  </svg>
                  {{ t("wordDrawing.drawMode") }}
                </button>
                <button
                  type="button" data-drawer-mode="keyboard" data-seasonal-tab :aria-pressed="state.inputMode === 'keyboard'" @click="handlers.setMode('keyboard')"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    state.inputMode === 'keyboard'
                      ? 'bg-white dark:bg-white/5 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                  ]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                    <line x1="6" y1="8" x2="6" y2="8" />
                    <line x1="10" y1="8" x2="10" y2="8" />
                    <line x1="14" y1="8" x2="14" y2="8" />
                    <line x1="18" y1="8" x2="18" y2="8" />
                    <line x1="6" y1="12" x2="6" y2="12" />
                    <line x1="10" y1="12" x2="10" y2="12" />
                    <line x1="14" y1="12" x2="14" y2="12" />
                    <line x1="18" y1="12" x2="18" y2="12" />
                    <line x1="8" y1="16" x2="16" y2="16" />
                  </svg>
                  {{ t("wordDrawing.keyboardMode") }}
                </button>
              </div>
            </div>

            <button
              type="button" class="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
              @click.stop="handlers.close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Main Content -->
          <div class="min-h-0 flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
            <!-- Drawing Canvas Area (only when draw mode) -->
            <div
              v-show="state.inputMode === 'draw'"
              class="min-h-[360px] shrink-0 flex-1 flex flex-col gap-2 p-3 lg:shrink lg:p-5 overflow-hidden lg:min-h-0"
            >
              <div class="mb-2 flex shrink-0 flex-wrap items-center gap-2">
                <button type="button" data-drawer-touchpad :aria-pressed="state.touchpadMode"
                  class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
                  :class="state.touchpadMode ? 'border-primary-500/40 bg-primary-500/10 text-primary-700 dark:text-primary-300' : 'border-black/10 text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10'"
                  @click="handlers.toggleTouchpadMode">
                  <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 15h18m-9 0v5"/></svg>
                  {{ t('wordDrawing.touchpadMode') }}
                </button>
                <button v-if="state.touchpadMode" type="button" data-drawer-touchpad-stroke :aria-pressed="state.touchpadArmed"
                  :disabled="state.isRecognizing" class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50"
                  :class="state.touchpadArmed ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200'"
                  @click="handlers.toggleTouchpadStroke">
                  {{ t(state.touchpadArmed ? 'wordDrawing.touchpadPause' : 'wordDrawing.touchpadStart') }}
                </button>
                <span v-if="state.touchpadMode" class="text-xs text-gray-500 dark:text-gray-400">{{ t('wordDrawing.touchpadHint') }}</span>
              </div>
<div data-drawer-toolbar class="flex shrink-0 flex-wrap items-center gap-1.5 rounded-xl border border-black/10 p-1.5 dark:border-white/10 dark:bg-white/[0.035]"><div class="flex flex-wrap gap-1.5">
                    <button
                      type="button" data-drawer-tool="brush" :aria-pressed="state.currentTool === 'brush'" @click="state.currentTool = 'brush'"
                      :class="[
                        'py-2 px-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                        state.currentTool === 'brush'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20',
                      ]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"
                        />
                        <path
                          d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"
                        />
                      </svg>
                      {{ t("wordDrawing.brush") }}
                    </button>
                    <button
                      type="button" data-drawer-tool="eraser" :aria-pressed="state.currentTool === 'eraser'" @click="state.currentTool = 'eraser'"
                      :class="[
                        'py-2 px-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                        state.currentTool === 'eraser'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20',
                      ]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L13.8 2.4c.8-.8 2-.8 2.8 0L21 6.8c.8.8.8 2 0 2.8L12 18.6"
                        />
                        <path d="M5 18H2" />
                      </svg>
                      {{ t("wordDrawing.eraser") }}
                    </button>
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                  <button
                    @click="handlers.undoLast"
                    :disabled="state.historyIndex <= 0"
                    class="py-2 px-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    {{ t("wordDrawing.undo") }}
                  </button>
                  <button
                    @click="handlers.redoLast"
                    :disabled="state.historyIndex >= state.history.length - 1"
                    class="py-2 px-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    {{ t("wordDrawing.redo") }}
                  </button>
                  <button
                    @click="handlers.clearCanvas"
                    class="py-2 px-2.5 rounded-lg text-sm font-medium bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      />
                    </svg>
                    {{ t("wordDrawing.clearCanvas") }}
                  </button>
                </div></div>
              <!-- Canvas Container -->
              <div
                class="flex-1 min-h-[180px] relative rounded-2xl overflow-hidden bg-white dark:bg-black border border-black/15 dark:border-white/15 shadow-sm" :class="{ 'drawing-checkerboard': state.canvasBackground === 'transparent' }"
              >
                <canvas
                  :ref="setCanvasRef"
                  class="absolute inset-0 w-full h-full cursor-crosshair touch-none select-none" :style="{ backgroundColor: state.canvasBackground === 'theme' ? state.surfaceColor : 'transparent', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }"
                  @pointerdown="handlers.startDrawing"
                  @pointermove="handlers.draw"
                  @pointerup="handlers.stopDrawing"
                  @pointercancel="handlers.cancelDrawing"
                  @pointerleave="handlers.handlePointerLeave"
                  @lostpointercapture="handlers.cancelDrawing"
                  @contextmenu.prevent
                  @dragstart.prevent
                ></canvas>

                <!-- Empty State Hint -->
                <div
                  v-if="!state.hasDrawn"
                  class="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div class="text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-16 h-16 mx-auto mb-3 text-black/20 dark:text-white/25"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1"
                    >
                      <path d="M12 19l7-7 3 3-7 7-3-3z" />
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                      <path d="M2 2l7.586 7.586" />
                      <circle cx="11" cy="11" r="2" />
                    </svg>
                    <p class="text-black/40 dark:text-white/40 text-sm">
                      {{ t("wordDrawing.startDrawing") }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Keyboard Input Area (only when keyboard mode) -->
            <div v-if="state.inputMode === 'keyboard'" class="min-w-0 flex-1 flex flex-col p-3 lg:p-5 lg:min-h-0 lg:overflow-y-auto scrollbar-custom">
              <!-- Keyboard Language Selector -->
              <div class="mb-3 flex items-center gap-3 flex-wrap">
                <div class="flex bg-gray-100 dark:bg-white/10 rounded-lg p-0.5">
                  <button
                    data-seasonal-tab :aria-pressed="state.keyboardLanguage === 'english'" @click="state.keyboardLanguage = 'english'"
                    :class="[
                      'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      state.keyboardLanguage === 'english'
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                    ]"
                  >
                    <span class="text-sm">🇺🇸</span>
                    English
                  </button>
                  <button
                    data-seasonal-tab :aria-pressed="state.keyboardLanguage === 'chinese'" @click="state.keyboardLanguage = 'chinese'"
                    :class="[
                      'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      state.keyboardLanguage === 'chinese'
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                    ]"
                  >
                    <span class="text-sm">🇨🇳</span>
                    中文 (拼音)
                  </button>
                </div>

                <!-- Shift Toggle (for English) -->
                <button
                  v-if="state.keyboardLanguage === 'english'"
                  @click="state.isShift = !state.isShift"
                  :class="[
                    'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border-2',
                    state.isShift
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 hover:border-primary-500',
                  ]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 2L3 12h6v10h6V12h6L12 2z" />
                  </svg>
                  Shift
                </button>

                <!-- Tone Selector (for Chinese) -->
                <div
                  v-if="state.keyboardLanguage === 'chinese'"
                  class="flex items-center gap-1.5"
                >
                  <span class="text-xs text-gray-500 dark:text-gray-400"
                    >{{ t("wordDrawing.toneSelect") }}:</span
                  >
                  <div class="flex gap-1">
                    <button
                      v-for="tone in toneOptions"
                      :key="tone.value"
                      @click="handlers.applyToneToBuffer(tone.value)"
                      :class="[
                        'w-8 h-8 rounded-md text-sm font-medium transition-all duration-200 border-2',
                        state.selectedTone === tone.value
                          ? 'bg-gradient-to-br from-primary-500 to-secondary-500 border-primary-500 text-white'
                          : 'border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:border-primary-500',
                      ]"
                      :title="tone.name"
                    >
                      {{ tone.label }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Word Display Area -->
              <div
                class="flex-1 min-w-0 flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/[0.025] border-2 border-gray-300 dark:border-white/20"
              >
                <!-- Display input text -->
                <div class="flex items-center justify-center p-4">
                  <div class="text-center w-full max-w-2xl">
                    <div
                      class="min-h-[80px] flex items-center justify-center px-4 py-3 rounded-xl bg-white dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/20 shadow-inner"
                    >
                      <p
                        v-if="state.keyboardInputText"
                        class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-all leading-relaxed"
                        :class="{
                          'font-chinese': state.keyboardLanguage === 'chinese',
                        }"
                      >
                        {{ state.keyboardInputText }}
                      </p>
                      <p
                        v-else
                        class="text-gray-400 dark:text-gray-500 text-lg"
                      >
                        {{ t("wordDrawing.typeHere") }}
                      </p>
                    </div>

                    <!-- Pinyin Buffer & Hanzi Candidates (Chinese Mode Only) -->
                    <div
                      v-if="
                        state.keyboardLanguage === 'chinese' &&
                        state.pinyinBuffer
                      "
                      class="mt-3"
                    >
                      <!-- Pinyin Buffer Display -->
                      <div class="flex items-center justify-center gap-2 mb-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                          >{{ t("wordDrawing.pinyinInput") }}:</span
                        >
                        <span
                          class="px-3 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium"
                        >
                          {{ state.pinyinBuffer }}
                        </span>
                        <button
                          @click="handlers.clearPinyinBuffer"
                          class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          :title="t('wordDrawing.clear')"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>

                      <!-- Hanzi Candidates -->
                      <div
                        v-if="state.hanziCandidates.length > 0"
                        class="flex flex-wrap justify-center gap-1"
                      >
                        <button
                          v-for="(char, index) in state.hanziCandidates"
                          :key="index"
                          @click="handlers.selectHanzi(char)"
                          class="min-w-[36px] h-9 px-2 rounded-lg text-lg font-medium bg-gradient-to-br from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 "
                        >
                          <span class="font-chinese">{{ char }}</span>
                        </button>
                      </div>
                      <p
                        v-else
                        class="text-xs text-gray-400 dark:text-gray-500"
                      >
                        {{ t("wordDrawing.noHanziFound") }}
                      </p>
                    </div>

                    <p
                      v-else
                      class="mt-3 text-sm text-gray-500 dark:text-gray-400"
                    >
                      {{
                        state.keyboardLanguage === "chinese"
                          ? t("wordDrawing.chinesePinyinHint")
                          : t("wordDrawing.englishKeyboardHint")
                      }}
                    </p>
                  </div>
                </div>

                <!-- Virtual Keyboard -->
                <div
                  class="p-3 lg:p-4 bg-gradient-to-t from-gray-200/80 to-gray-100/50 dark:from-black dark:to-white/[0.035] border-t border-gray-300 dark:border-white/10"
                >
                  <!-- English Keyboard -->
                  <div
                    v-if="state.keyboardLanguage === 'english'"
                    class="keyboard-container"
                  >
                    <div
                      v-for="(row, rowIndex) in englishKeyboardRows"
                      :key="rowIndex"
                      class="flex min-w-0 justify-center gap-1 mb-1"
                    >
                      <button
                        v-for="key in row"
                        :key="key.value"
                        @click="handlers.handleKeyPress(key)"
                        :class="[
                          'relative keyboard-key',
                          key.type === 'special'
                            ? 'keyboard-key-special'
                            : 'keyboard-key-normal',
                          key.value === 'space' ? 'keyboard-key-space' : '',
                          key.value === 'backspace'
                            ? 'keyboard-key-backspace'
                            : '',
                        ]"
                      >
                        <div
                          v-if="state.activeKeyPreview === key.value"
                          class="key-preview-popup"
                        >
                          {{
                            state.isShift
                              ? key.label.toUpperCase()
                              : key.label.toLowerCase()
                          }}
                        </div>
                        <template v-if="key.value === 'backspace'">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"
                            />
                            <line x1="18" y1="9" x2="12" y2="15" />
                            <line x1="12" y1="9" x2="18" y2="15" />
                          </svg>
                        </template>
                        <template v-else-if="key.value === 'space'">
                          {{ t("wordDrawing.space") }}
                        </template>
                        <template v-else>
                          {{
                            state.isShift
                              ? key.label.toUpperCase()
                              : key.label.toLowerCase()
                          }}
                        </template>
                      </button>
                    </div>
                  </div>

                  <!-- Chinese Pinyin Keyboard -->
                  <div v-else class="keyboard-container">
                    <!-- Standard keys -->
                    <div
                      v-for="(row, rowIndex) in chinesePinyinRows"
                      :key="rowIndex"
                      class="flex min-w-0 justify-center gap-1 mb-1"
                    >
                      <button
                        v-for="key in row"
                        :key="key.value"
                        @click="handlers.handlePinyinKeyPress(key)"
                        :class="[
                          'relative keyboard-key',
                          key.type === 'special' ? 'keyboard-key-special' : '',
                          key.type === 'vowel' ? 'keyboard-key-vowel' : '',
                          key.type === 'consonant'
                            ? 'keyboard-key-consonant'
                            : '',
                          key.value === 'space' ? 'keyboard-key-space' : '',
                          key.value === 'backspace'
                            ? 'keyboard-key-backspace'
                            : '',
                        ]"
                      >
                        <div
                          v-if="state.activeKeyPreview === key.value"
                          class="key-preview-popup"
                        >
                          {{ key.label }}
                        </div>
                        <template v-if="key.value === 'backspace'">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"
                            />
                            <line x1="18" y1="9" x2="12" y2="15" />
                            <line x1="12" y1="9" x2="18" y2="15" />
                          </svg>
                        </template>
                        <template v-else-if="key.value === 'space'">
                          {{ t("wordDrawing.space") }}
                        </template>
                        <template v-else>
                          {{ key.label }}
                        </template>
                      </button>
                    </div>

                    <!-- Tone vowels quick access -->
                    <div
                      class="mt-2 pt-2 border-t border-gray-300/50 dark:border-white/10"
                    >
                      <p
                        class="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center"
                      >
                        {{ t("wordDrawing.tonedVowels") }}
                      </p>
                      <div class="flex min-w-0 flex-wrap justify-center gap-1">
                        <button
                          v-for="vowel in handlers.getTonedVowels()"
                          :key="vowel"
                          @click="handlers.insertCharacter(vowel)"
                          class="keyboard-key keyboard-key-toned"
                        >
                          {{ vowel }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tools & Preview Panel -->
            <div
              class="w-full min-w-0 shrink-0 border-t border-black/10 p-3 flex flex-col gap-3 bg-black/[0.015] dark:border-white/10 dark:bg-white/[0.025] lg:min-h-0 lg:w-[340px] lg:overflow-y-auto lg:overscroll-contain lg:border-l lg:border-t-0 lg:p-4 scrollbar-custom"
            >
              <!-- Word Input Section -->
              <div
                class="rounded-2xl p-3 sm:p-4 border border-primary-500/20 bg-primary-50/60 dark:bg-primary-500/[0.07]"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-primary-500"></span>
                  {{ t("wordDrawing.word") }}
                  <span
                    class="text-xs text-primary-700 dark:text-primary-300 font-normal ml-auto"
                    >{{ t("wordDrawing.requiredField") }}</span
                  >
                </h3>

                <!-- OCR Language Selector (only for draw mode) -->
                <div v-if="state.inputMode === 'draw'" class="mb-3">
                  <ModalSelect
                    data-drawer-language :model-value="state.ocrLanguage"
                    :label="t('wordDrawing.ocrLanguage')"
                    :options="ocrLanguageOptions"
                    @update:model-value="handlers.setRecognitionLanguage(String($event))"
                  />
                </div>

                <div v-if="state.inputMode === 'draw'" class="mb-3" data-drawer-recognition-unit>
                    <ModalSelect :model-value="state.recognitionUnit" :label="t('wordDrawing.recognitionUnit')" :options="[{value:'auto',label:t('wordDrawing.recognitionAuto')},{value:'character',label:t('wordDrawing.recognitionCharacter')},{value:'word',label:t('wordDrawing.recognitionWord')}]" @update:model-value="handlers.setRecognitionUnit($event as 'auto'|'character'|'word')" />
                    <p v-if="state.recognitionUnit==='character'" class="mt-1 text-xs text-black/50 dark:text-white/50">{{t('wordDrawing.recognitionCharacterHint')}}</p>
                  </div>
                  <!-- Recognize Button (only for draw mode) -->
                <button
                  v-if="state.inputMode === 'draw'"
                  type="button"
                  data-drawer-recognize
                  @click="handlers.recognizeText"
                  :disabled="!state.hasDrawn || state.isRecognizing"
                  class="w-full mb-3 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg
                    v-if="state.isRecognizing"
                    class="animate-spin w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  {{
                    state.isRecognizing
                      ? t("wordDrawing.recognizing")
                      : t("wordDrawing.recognizeDrawing")
                  }}
                </button>

                <!-- Use Keyboard Text Button (only for keyboard mode) -->
                <button
                  v-if="state.inputMode === 'keyboard'"
                  type="button"
                  @click="handlers.useKeyboardText"
                  :disabled="!state.keyboardInputText.trim() && !state.pinyinBuffer.trim()"
                  class="w-full mb-3 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="9 11 12 14 22 4" />
                    <path
                      d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                    />
                  </svg>
                  {{ t("wordDrawing.useTypedText") }}
                </button>

                <!-- Clear Input Button (only for keyboard mode) -->
                <button
                  v-if="state.inputMode === 'keyboard'"
                  type="button"
                  @click="handlers.clearKeyboardInput"
                  :disabled="!state.keyboardInputText"
                  class="w-full mb-3 py-2.5 px-4 rounded-xl text-sm font-semibold bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  {{ t("wordDrawing.clearInput") }}
                </button>

                <!-- Word Input -->
                <input
                  data-drawer-word
                  :value="state.wordText"
                  @input="!($event as InputEvent).isComposing && handlers.setWordText(($event.target as HTMLInputElement).value)"
                  @compositionend="handlers.setWordText(($event.target as HTMLInputElement).value)"
                  type="text"
                  :placeholder="t('wordDrawing.enterWordHere')"
                  class="w-full px-4 py-3 rounded-xl border border-primary-500/25 dark:border-primary-400/25 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-medium"
                />
                <p class="mt-2 text-xs text-primary-700 dark:text-primary-300">
                  {{ t(state.inputMode === "draw" ? "wordDrawing.drawingHint" : "wordDrawing.wordInputHint") }}
                </p>
                <div v-if="state.inputMode==='draw' && state.strokeCandidates.length" class="mt-3 max-h-48 space-y-2 overflow-y-auto scrollbar-custom" data-hanzi-candidates data-drawer-candidates>
                  <div v-for="(group,index) in state.strokeCandidates" :key="index" class="space-y-1">
                    <p class="text-xs text-gray-600 dark:text-gray-400">{{ t('wordDrawing.characterCandidates',{index:index+1}) }}</p>
                    <div class="flex flex-wrap gap-1.5">
                      <button v-for="candidate in group" :key="candidate.hanzi" type="button" :aria-pressed="state.chosenCharacters[index]===candidate.hanzi" class="min-w-[36px] rounded-lg border px-2 py-1.5 text-lg font-medium transition-colors" :class="state.chosenCharacters[index]===candidate.hanzi?'border-primary-500 bg-primary-500/15 text-primary-700 dark:text-primary-300':'border-gray-200 dark:border-white/10 hover:bg-primary-500/10 text-gray-800 dark:text-gray-200'" @click="handlers.chooseCharacter(index,candidate.hanzi)">{{ candidate.hanzi }}</button>
                    </div>
                  </div>
                </div>
                <p v-if="state.inputMode==='draw' && state.recognitionStatus!=='idle'" data-drawer-status role="status" class="mt-2 text-xs break-words" :class="state.recognitionStatus==='ready' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">{{ t('wordDrawing.ocr_'+state.recognitionStatus) }}</p>
              </div>

              <!-- Brush Tools (Draw Mode Only) -->
              <div
                v-if="state.inputMode === 'draw'"
                class="rounded-2xl p-3 sm:p-4 border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.035]"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-secondary-500"></span>
                  {{ t("wordDrawing.brushSettings") }}
                </h3>

                <!-- Brush Size -->
                <div class="mb-4">
                  <label
                    class="text-xs text-gray-500 dark:text-gray-400 mb-2 block"
                    >{{ t("wordDrawing.brushSize") }}:
                    {{ state.brushSize }}px</label
                  >
                  <input
                    type="range"
                    v-model.number="state.brushSize"
                    min="1"
                    max="50"
                    class="w-full cursor-pointer accent-primary-500"
                  />
                </div>

                <!-- Brush Color -->
                <div class="mb-4">
                  <label
                    class="text-xs text-gray-500 dark:text-gray-400 mb-2 block"
                    >{{ t("wordDrawing.brushColor") }}</label
                  >
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="color in state.palette"
                      :key="color"
                      type="button" data-drawer-color :title="color" :aria-label="color" :aria-pressed="state.brushColor===color" @click="handlers.chooseBrushColor(color)"
                      :class="[
                        'w-8 h-8 rounded-lg border-2 transition-all ',
                        state.brushColor === color
                          ? 'border-primary-500 ring-2 ring-primary-500/30 scale-110'
                          : 'border-gray-300 dark:border-white/20',
                      ]"
                      :style="{ backgroundColor: color }"
                    ></button>
                    <div class="relative">
                      <input
                        type="color"
                        data-drawer-custom-color :value="state.brushColor" :aria-label="t('wordDrawing.brushColor')" @change="onCustomBrushColor"
                        class="opacity-0 absolute inset-0 z-10 w-8 h-8 cursor-pointer"
                      />
                      <div
                        class="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-white/20 flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-4 h-4 text-white drop-shadow"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Background Settings (Draw Mode Only) -->
              <div
                v-if="state.inputMode === 'draw'"
                class="rounded-2xl p-3 sm:p-4 border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.035]"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-cyan-500"></span>
                  {{ t("wordDrawing.background") }}
                </h3>
                <div class="flex gap-2">
                  <button v-for="background in (['theme','transparent'] as const)" :key="background"
                    type="button" :data-drawer-background="background" :aria-pressed="state.canvasBackground===background"
                    @click="state.canvasBackground=background"
                    class="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors"
                    :class="state.canvasBackground===background?'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300':'border-black/10 bg-white text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70'">
                    <span class="h-5 w-5 shrink-0 rounded-md border border-black/15 bg-white dark:border-white/20 dark:bg-black" :class="{'drawing-checkerboard':background==='transparent'}"></span>
                    {{ t(background==='theme'?'wordDrawing.themeBackground':'wordDrawing.transparent') }}
                  </button>
                </div>
              </div>
              <!-- Preview Section (Draw Mode Only) -->
              <div
                v-if="state.inputMode === 'draw'"
                class="rounded-2xl p-3 sm:p-4 border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.035]"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-primary-500"></span>
                  {{ t("wordDrawing.preview") }}
                </h3>
                <div
                  class="aspect-[16/10] rounded-xl overflow-hidden bg-white dark:bg-black border border-black/10 dark:border-white/10" :class="{ 'drawing-checkerboard': state.canvasBackground === 'transparent' }"
                >
                  <img
                    v-if="state.previewDataUrl"
                    :src="state.previewDataUrl"
                    alt="Preview"
                    class="w-full h-full object-contain"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center"
                  >
                    <span class="text-gray-400 dark:text-gray-500 text-xs">{{
                      t("wordDrawing.noPreview")
                    }}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <div
            class="p-3 sm:px-6 sm:py-4 border-t border-black/10 dark:border-white/10 grid grid-cols-2 gap-2.5 shrink-0 bg-white dark:bg-black"
          >
            <button
              type="button"
              @click="handlers.close"
              class="min-h-11 min-w-0 break-words rounded-xl bg-black/5 px-3 py-2 text-sm font-semibold text-black transition hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              {{ t("wordDrawing.cancel") }}
            </button>
            <button
              type="button"
              data-drawer-confirm
              @click="handlers.confirm"
              :disabled="!state.canConfirm"
              class="min-h-11 min-w-0 break-words px-3 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{
                state.isRecognizing ? t("wordDrawing.recognizing") : state.inputMode === "draw"
                  ? t("wordDrawing.useDrawing")
                  : t("wordDrawing.useKeyboard")
              }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import ModalSelect from "./ModalSelect.vue";
import { useI18n } from "vue-i18n";
import { useWordDrawingState } from "./composables/word-drawing/manager-state/useWordDrawingState";
import { useWordDrawingHandle } from "./composables/word-drawing/manager-handle/useWordDrawingHandle";
import { useWordDrawingMount } from "./composables/word-drawing/manager-mount/useWordDrawingMount";
import {
  englishKeyboardRows,
  chinesePinyinRows,
  toneOptions,
} from "./composables/word-drawing/manager-state/wordDrawingData";

const props = defineProps<{
  visible: boolean;
  word: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", payload: { imageDataUrl: string; word: string }): void;
}>();

const ocrLanguageOptions = [
  { value: "chi_sim", label: "\u4e2d\u6587 (\u7b80\u4f53)" },
  { value: "chi_tra", label: "\u4e2d\u6587 (\u7e41\u9ad4)" },
  { value: "eng", label: "English" },
  { value: "jpn", label: "\u65e5\u672c\u8a9e" },
  { value: "kor", label: "\ud55c\uad6d\uc5b4" },
  { value: "vie", label: "Ti\u1ebfng Vi\u1ec7t" },
];

const { t } = useI18n();

// Initialize state
const stateRaw = useWordDrawingState();
const state = reactive(stateRaw);

function setCanvasRef(el: unknown) {
  state.canvasRef = el instanceof HTMLCanvasElement ? el : null;
}

// Initialize handlers
const handlers = useWordDrawingHandle(stateRaw, emit);

function onCustomBrushColor(event: Event) {
  const input = event.target as HTMLInputElement;
  handlers.chooseBrushColor(input.value);
  input.value = state.brushColor;
}

// Initialize lifecycle
useWordDrawingMount(stateRaw, handlers, props);

// Expose state and handlers to template
// Keep state and handlers objects directly
// No destructuring needed
</script>

<style scoped>
@import "@/styles/word-drawing-modal.css";
</style>
