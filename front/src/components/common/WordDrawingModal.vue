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
        class="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        @click.self="close"
      >
        <div
          class="w-full h-[90vh] max-w-5xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 flex-shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center"
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
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ t("wordDrawing.wordDrawer") }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t("wordDrawing.drawYourWord") }}
                </p>
              </div>
            </div>

            <!-- Input Mode Toggle -->
            <div class="flex items-center gap-2 mr-4">
              <div class="flex bg-gray-100 dark:bg-white/10 rounded-xl p-1">
                <button
                  @click="state.inputMode = 'draw'"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    state.inputMode === 'draw'
                      ? 'bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 shadow-sm'
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
                  @click="state.inputMode = 'keyboard'"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    state.inputMode === 'keyboard'
                      ? 'bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 shadow-sm'
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
              class="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
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
          <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <!-- Drawing Canvas Area (only when draw mode) -->
            <div
              v-if="state.inputMode === 'draw'"
              class="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden"
            >
              <!-- Canvas Container -->
              <div
                class="flex-1 relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 border-2 border-dashed border-gray-300 dark:border-white/20"
              >
                <canvas
                  :ref="(el) => (state.canvasRef = el)"
                  class="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                  @mousedown="handlers.startDrawing"
                  @mousemove="handlers.draw"
                  @mouseup="handlers.stopDrawing"
                  @mouseleave="handlers.stopDrawing"
                  @touchstart.prevent="handlers.handleTouchStart"
                  @touchmove.prevent="handlers.handleTouchMove"
                  @touchend.prevent="handlers.stopDrawing"
                ></canvas>

                <!-- Empty State Hint -->
                <div
                  v-if="!state.hasDrawn"
                  class="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div class="text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-600"
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
                    <p class="text-gray-400 dark:text-gray-500 text-sm">
                      {{ t("wordDrawing.startDrawing") }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Keyboard Input Area (only when keyboard mode) -->
            <div v-else class="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto">
              <!-- Keyboard Language Selector -->
              <div class="mb-3 flex items-center gap-3 flex-wrap">
                <div class="flex bg-gray-100 dark:bg-white/10 rounded-lg p-0.5">
                  <button
                    @click="state.keyboardLanguage = 'english'"
                    :class="[
                      'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      state.keyboardLanguage === 'english'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                    ]"
                  >
                    <span class="text-sm">🇺🇸</span>
                    English
                  </button>
                  <button
                    @click="state.keyboardLanguage = 'chinese'"
                    :class="[
                      'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      state.keyboardLanguage === 'chinese'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-500/30'
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
                          ? 'bg-gradient-to-br from-red-500 to-orange-500 border-red-500 text-white shadow-lg shadow-red-500/30 scale-105'
                          : 'border-gray-300 dark:border-white/20 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:border-red-500 hover:scale-105',
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
                class="flex-1 flex flex-col rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 border-2 border-gray-300 dark:border-white/20"
              >
                <!-- Display input text -->
                <div class="flex items-center justify-center p-4">
                  <div class="text-center w-full max-w-2xl">
                    <div
                      class="min-h-[80px] flex items-center justify-center px-4 py-3 rounded-xl bg-white dark:bg-neutral-800 border-2 border-dashed border-gray-300 dark:border-white/20 shadow-inner"
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
                          class="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium"
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
                          class="min-w-[36px] h-9 px-2 rounded-lg text-lg font-medium bg-gradient-to-br from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
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
                  class="p-3 lg:p-4 bg-gradient-to-t from-gray-200/80 to-gray-100/50 dark:from-neutral-950/80 dark:to-neutral-900/50 border-t border-gray-300 dark:border-white/10"
                >
                  <!-- English Keyboard -->
                  <div
                    v-if="state.keyboardLanguage === 'english'"
                    class="keyboard-container"
                  >
                    <div
                      v-for="(row, rowIndex) in englishKeyboardRows"
                      :key="rowIndex"
                      class="flex justify-center gap-1 mb-1"
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
                      class="flex justify-center gap-1 mb-1"
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
                      <div class="flex justify-center gap-1">
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
              class="w-full lg:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-white/10 p-4 lg:p-6 flex flex-col gap-4 overflow-y-auto bg-gray-50/50 dark:bg-white/5"
            >
              <!-- Word Input Section -->
              <div
                class="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border-2 border-emerald-200 dark:border-emerald-700/50 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {{ t("wordDrawing.word") }}
                  <span
                    class="text-xs text-emerald-600 dark:text-emerald-400 font-normal ml-auto"
                    >{{ t("wordDrawing.requiredField") }}</span
                  >
                </h3>

                <!-- OCR Language Selector (only for draw mode) -->
                <div v-if="state.inputMode === 'draw'" class="mb-3">
                  <label
                    class="text-xs text-gray-500 dark:text-gray-400 mb-1 block"
                    >{{ t("wordDrawing.ocrLanguage") }}</label
                  >
                  <select
                    v-model="state.ocrLanguage"
                    class="w-full px-3 py-2.5 rounded-lg border border-emerald-300 dark:border-emerald-600/50 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                    style="
                      background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2310b981%27 stroke-width=%272%27%3E%3Cpolyline points=%276 9 12 15 18 9%27/%3E%3C/svg%3E');
                      background-position: right 0.5rem center;
                      background-size: 1.25rem;
                    "
                  >
                    <option
                      value="chi_sim"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      中文 (简体)
                    </option>
                    <option
                      value="chi_tra"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      中文 (繁體)
                    </option>
                    <option
                      value="eng"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      English
                    </option>
                    <option
                      value="jpn"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      日本語
                    </option>
                    <option
                      value="kor"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      한국어
                    </option>
                    <option
                      value="vie"
                      class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      Tiếng Việt
                    </option>
                  </select>
                </div>

                <!-- Recognize Button (only for draw mode) -->
                <button
                  v-if="state.inputMode === 'draw'"
                  type="button"
                  @click="handlers.recognizeText"
                  :disabled="!state.hasDrawn || state.isRecognizing"
                  class="w-full mb-3 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  :disabled="!state.keyboardInputText.trim()"
                  class="w-full mb-3 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  v-model="state.wordText"
                  type="text"
                  :placeholder="t('wordDrawing.enterWordHere')"
                  class="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600/50 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-medium"
                />
                <p class="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  {{ t("wordDrawing.wordInputHint") }}
                </p>
              </div>

              <!-- Preview Section (Draw Mode Only) -->
              <div
                v-if="state.inputMode === 'draw'"
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-primary-500"></span>
                  {{ t("wordDrawing.preview") }}
                </h3>
                <div
                  class="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-900 border border-gray-200 dark:border-white/10"
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

              <!-- Brush Tools (Draw Mode Only) -->
              <div
                v-if="state.inputMode === 'draw'"
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
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
                    class="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
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
                      v-for="color in colorPalette"
                      :key="color"
                      @click="state.brushColor = color"
                      :class="[
                        'w-8 h-8 rounded-lg border-2 transition-all hover:scale-110',
                        state.brushColor === color
                          ? 'border-primary-500 ring-2 ring-primary-500/30 scale-110'
                          : 'border-gray-300 dark:border-white/20',
                      ]"
                      :style="{ backgroundColor: color }"
                    ></button>
                    <div class="relative">
                      <input
                        type="color"
                        v-model="state.brushColor"
                        class="opacity-0 absolute inset-0 w-8 h-8 cursor-pointer"
                      />
                      <div
                        class="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-white/20 flex items-center justify-center bg-gradient-to-br from-red-500 via-green-500 to-blue-500"
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

                <!-- Tool Selection -->
                <div>
                  <label
                    class="text-xs text-gray-500 dark:text-gray-400 mb-2 block"
                    >{{ t("wordDrawing.tool") }}</label
                  >
                  <div class="flex gap-2">
                    <button
                      @click="state.currentTool = 'brush'"
                      :class="[
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
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
                      @click="state.currentTool = 'eraser'"
                      :class="[
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                        state.currentTool === 'eraser'
                          ? 'bg-rose-500 text-white'
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
                </div>
              </div>

              <!-- Action Buttons (Draw Mode Only) -->
              <div
                v-if="state.inputMode === 'draw'"
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  {{ t("wordDrawing.actions") }}
                </h3>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="handlers.undoLast"
                    :disabled="state.historyIndex < 0"
                    class="py-2 px-3 rounded-lg text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    class="py-2 px-3 rounded-lg text-sm font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    class="col-span-2 py-2 px-3 rounded-lg text-sm font-medium bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-all flex items-center justify-center gap-2"
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
                </div>
              </div>

              <!-- Background Settings (Draw Mode Only) -->
              <div
                v-if="state.inputMode === 'draw'"
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-cyan-500"></span>
                  {{ t("wordDrawing.background") }}
                </h3>
                <div class="flex gap-2">
                  <button
                    @click="state.canvasBackground = 'white'"
                    :class="[
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border-2',
                      state.canvasBackground === 'white'
                        ? 'border-primary-500 bg-white text-gray-900'
                        : 'border-gray-200 dark:border-white/10 bg-white text-gray-600',
                    ]"
                  >
                    {{ t("wordDrawing.white") }}
                  </button>
                  <button
                    @click="state.canvasBackground = 'transparent'"
                    :class="[
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border-2',
                      state.canvasBackground === 'transparent'
                        ? 'border-primary-500 bg-[url(\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill-opacity%3D%22.05%22%3E%3Crect%20x%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3Crect%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3C%2Fsvg%3E\')] text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-white/10 bg-[url(\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill-opacity%3D%22.05%22%3E%3Crect%20x%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3Crect%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3C%2Fsvg%3E\')] text-gray-600 dark:text-gray-300',
                    ]"
                  >
                    {{ t("wordDrawing.transparent") }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="p-4 lg:p-6 border-t border-black/5 dark:border-white/10 flex gap-3 flex-shrink-0 bg-gray-50 dark:bg-white/5"
          >
            <button
              type="button"
              @click="handlers.close"
              class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              {{ t("wordDrawing.cancel") }}
            </button>
            <div class="flex-1"></div>
            <button
              type="button"
              @click="handlers.confirm"
              :disabled="!state.canConfirm"
              class="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{
                state.inputMode === "draw"
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
import { useI18n } from "vue-i18n";
import { useWordDrawingState } from "./composables/word-drawing/manager-state/useWordDrawingState";
import { useWordDrawingHandle } from "./composables/word-drawing/manager-handle/useWordDrawingHandle";
import { useWordDrawingMount } from "./composables/word-drawing/manager-mount/useWordDrawingMount";
import {
  englishKeyboardRows,
  chinesePinyinRows,
  colorPalette,
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

const { t } = useI18n();

// Initialize state
const stateRaw = useWordDrawingState();
const state = reactive(stateRaw);

// Initialize handlers
const handlers = useWordDrawingHandle(stateRaw, emit);

// Initialize lifecycle
useWordDrawingMount(stateRaw, handlers, props);

// Expose state and handlers to template
// Keep state and handlers objects directly
// No destructuring needed
</script>

<style scoped>
@import "@/styles/word-drawing-modal.css";
</style>
