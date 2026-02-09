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
                  {{ t("vocabulary.wordDrawer") }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t("vocabulary.drawYourWord") }}
                </p>
              </div>
            </div>

            <!-- Input Mode Toggle -->
            <div class="flex items-center gap-2 mr-4">
              <div class="flex bg-gray-100 dark:bg-white/10 rounded-xl p-1">
                <button
                  @click="inputMode = 'draw'"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    inputMode === 'draw'
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
                  {{ t("vocabulary.drawMode") }}
                </button>
                <button
                  @click="inputMode = 'keyboard'"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    inputMode === 'keyboard'
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
                  {{ t("vocabulary.keyboardMode") }}
                </button>
              </div>
            </div>

            <button
              class="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
              @click.stop="close"
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
              v-if="inputMode === 'draw'"
              class="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden"
            >
              <!-- Canvas Container -->
              <div
                class="flex-1 relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 border-2 border-dashed border-gray-300 dark:border-white/20"
              >
                <canvas
                  ref="canvasRef"
                  class="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                  @mousedown="startDrawing"
                  @mousemove="draw"
                  @mouseup="stopDrawing"
                  @mouseleave="stopDrawing"
                  @touchstart.prevent="handleTouchStart"
                  @touchmove.prevent="handleTouchMove"
                  @touchend.prevent="stopDrawing"
                ></canvas>

                <!-- Empty State Hint -->
                <div
                  v-if="!hasDrawn"
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
                      {{ t("vocabulary.startDrawing") }}
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
                    @click="keyboardLanguage = 'english'"
                    :class="[
                      'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      keyboardLanguage === 'english'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                    ]"
                  >
                    <span class="text-sm">🇺🇸</span>
                    English
                  </button>
                  <button
                    @click="keyboardLanguage = 'chinese'"
                    :class="[
                      'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      keyboardLanguage === 'chinese'
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
                  v-if="keyboardLanguage === 'english'"
                  @click="isShift = !isShift"
                  :class="[
                    'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border-2',
                    isShift
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
                  v-if="keyboardLanguage === 'chinese'"
                  class="flex items-center gap-1.5"
                >
                  <span class="text-xs text-gray-500 dark:text-gray-400"
                    >{{ t("vocabulary.toneSelect") }}:</span
                  >
                  <div class="flex gap-1">
                    <button
                      v-for="tone in toneOptions"
                      :key="tone.value"
                      @click="applyToneToBuffer(tone.value)"
                      :class="[
                        'w-8 h-8 rounded-md text-sm font-medium transition-all duration-200 border-2',
                        selectedTone === tone.value
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
                        v-if="keyboardInputText"
                        class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-all leading-relaxed"
                        :class="{
                          'font-chinese': keyboardLanguage === 'chinese',
                        }"
                      >
                        {{ keyboardInputText }}
                      </p>
                      <p
                        v-else
                        class="text-gray-400 dark:text-gray-500 text-lg"
                      >
                        {{ t("vocabulary.typeHere") }}
                      </p>
                    </div>

                    <!-- Pinyin Buffer & Hanzi Candidates (Chinese Mode Only) -->
                    <div
                      v-if="keyboardLanguage === 'chinese' && pinyinBuffer"
                      class="mt-3"
                    >
                      <!-- Pinyin Buffer Display -->
                      <div class="flex items-center justify-center gap-2 mb-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400"
                          >{{ t("vocabulary.pinyinInput") }}:</span
                        >
                        <span
                          class="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium"
                        >
                          {{ pinyinBuffer }}
                        </span>
                        <button
                          @click="clearPinyinBuffer"
                          class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          :title="t('vocabulary.clear')"
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
                        v-if="hanziCandidates.length > 0"
                        class="flex flex-wrap justify-center gap-1"
                      >
                        <button
                          v-for="(char, index) in hanziCandidates"
                          :key="index"
                          @click="selectHanzi(char)"
                          class="min-w-[36px] h-9 px-2 rounded-lg text-lg font-medium bg-gradient-to-br from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                        >
                          <span class="font-chinese">{{ char }}</span>
                        </button>
                      </div>
                      <p
                        v-else
                        class="text-xs text-gray-400 dark:text-gray-500"
                      >
                        {{ t("vocabulary.noHanziFound") }}
                      </p>
                    </div>

                    <p
                      v-else
                      class="mt-3 text-sm text-gray-500 dark:text-gray-400"
                    >
                      {{
                        keyboardLanguage === "chinese"
                          ? t("vocabulary.chinesePinyinHint")
                          : t("vocabulary.englishKeyboardHint")
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
                    v-if="keyboardLanguage === 'english'"
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
                        @click="handleKeyPress(key)"
                        :class="[
                          'keyboard-key',
                          key.type === 'special'
                            ? 'keyboard-key-special'
                            : 'keyboard-key-normal',
                          key.value === 'space' ? 'keyboard-key-space' : '',
                          key.value === 'backspace'
                            ? 'keyboard-key-backspace'
                            : '',
                        ]"
                      >
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
                          {{ t("vocabulary.space") }}
                        </template>
                        <template v-else>
                          {{
                            isShift
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
                        @click="handlePinyinKeyPress(key)"
                        :class="[
                          'keyboard-key',
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
                          {{ t("vocabulary.space") }}
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
                        {{ t("vocabulary.tonedVowels") }}
                      </p>
                      <div class="flex justify-center gap-1">
                        <button
                          v-for="vowel in getTonedVowels()"
                          :key="vowel"
                          @click="insertCharacter(vowel)"
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
                  {{ t("vocabulary.word") }}
                  <span
                    class="text-xs text-emerald-600 dark:text-emerald-400 font-normal ml-auto"
                    >{{ t("vocabulary.requiredField") }}</span
                  >
                </h3>

                <!-- OCR Language Selector (only for draw mode) -->
                <div v-if="inputMode === 'draw'" class="mb-3">
                  <label
                    class="text-xs text-gray-500 dark:text-gray-400 mb-1 block"
                    >{{ t("vocabulary.ocrLanguage") }}</label
                  >
                  <select
                    v-model="ocrLanguage"
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
                  v-if="inputMode === 'draw'"
                  type="button"
                  @click="recognizeText"
                  :disabled="!hasDrawn || isRecognizing"
                  class="w-full mb-3 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg
                    v-if="isRecognizing"
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
                    isRecognizing
                      ? t("vocabulary.recognizing")
                      : t("vocabulary.recognizeDrawing")
                  }}
                </button>

                <!-- Use Keyboard Text Button (only for keyboard mode) -->
                <button
                  v-if="inputMode === 'keyboard'"
                  type="button"
                  @click="useKeyboardText"
                  :disabled="!keyboardInputText.trim()"
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
                  {{ t("vocabulary.useTypedText") }}
                </button>

                <!-- Word Input -->
                <input
                  v-model="wordText"
                  type="text"
                  :placeholder="t('vocabulary.enterWordHere')"
                  class="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-600/50 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-medium"
                />
                <p class="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  {{ t("vocabulary.wordInputHint") }}
                </p>
              </div>

              <!-- Preview Section (Draw Mode Only) -->
              <div
                v-if="inputMode === 'draw'"
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-primary-500"></span>
                  {{ t("vocabulary.preview") }}
                </h3>
                <div
                  class="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-900 border border-gray-200 dark:border-white/10"
                >
                  <img
                    v-if="previewDataUrl"
                    :src="previewDataUrl"
                    alt="Preview"
                    class="w-full h-full object-contain"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center"
                  >
                    <span class="text-gray-400 dark:text-gray-500 text-xs">{{
                      t("vocabulary.noPreview")
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Brush Tools (Draw Mode Only) -->
              <div
                v-if="inputMode === 'draw'"
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-secondary-500"></span>
                  {{ t("vocabulary.brushSettings") }}
                </h3>

                <!-- Brush Size -->
                <div class="mb-4">
                  <label
                    class="text-xs text-gray-500 dark:text-gray-400 mb-2 block"
                    >{{ t("vocabulary.brushSize") }}: {{ brushSize }}px</label
                  >
                  <input
                    type="range"
                    v-model.number="brushSize"
                    min="1"
                    max="50"
                    class="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>

                <!-- Brush Color -->
                <div class="mb-4">
                  <label
                    class="text-xs text-gray-500 dark:text-gray-400 mb-2 block"
                    >{{ t("vocabulary.brushColor") }}</label
                  >
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="color in colorPalette"
                      :key="color"
                      @click="brushColor = color"
                      :class="[
                        'w-8 h-8 rounded-lg border-2 transition-all hover:scale-110',
                        brushColor === color
                          ? 'border-primary-500 ring-2 ring-primary-500/30 scale-110'
                          : 'border-gray-300 dark:border-white/20',
                      ]"
                      :style="{ backgroundColor: color }"
                    ></button>
                    <div class="relative">
                      <input
                        type="color"
                        v-model="brushColor"
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
                    >{{ t("vocabulary.tool") }}</label
                  >
                  <div class="flex gap-2">
                    <button
                      @click="currentTool = 'brush'"
                      :class="[
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                        currentTool === 'brush'
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
                      {{ t("vocabulary.brush") }}
                    </button>
                    <button
                      @click="currentTool = 'eraser'"
                      :class="[
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                        currentTool === 'eraser'
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
                      {{ t("vocabulary.eraser") }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Action Buttons (Draw Mode Only) -->
              <div
                v-if="inputMode === 'draw'"
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  {{ t("vocabulary.actions") }}
                </h3>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="undoLast"
                    :disabled="historyIndex < 0"
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
                    {{ t("vocabulary.undo") }}
                  </button>
                  <button
                    @click="redoLast"
                    :disabled="historyIndex >= history.length - 1"
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
                    {{ t("vocabulary.redo") }}
                  </button>
                  <button
                    @click="clearCanvas"
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
                    {{ t("vocabulary.clearCanvas") }}
                  </button>
                </div>
              </div>

              <!-- Background Settings (Draw Mode Only) -->
              <div
                v-if="inputMode === 'draw'"
                class="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-white/10 shadow-sm"
              >
                <h3
                  class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                >
                  <span class="w-2 h-2 rounded-full bg-cyan-500"></span>
                  {{ t("vocabulary.background") }}
                </h3>
                <div class="flex gap-2">
                  <button
                    @click="canvasBackground = 'white'"
                    :class="[
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border-2',
                      canvasBackground === 'white'
                        ? 'border-primary-500 bg-white text-gray-900'
                        : 'border-gray-200 dark:border-white/10 bg-white text-gray-600',
                    ]"
                  >
                    {{ t("vocabulary.white") }}
                  </button>
                  <button
                    @click="canvasBackground = 'transparent'"
                    :class="[
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border-2',
                      canvasBackground === 'transparent'
                        ? 'border-primary-500 bg-[url(\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill-opacity%3D%22.05%22%3E%3Crect%20x%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3Crect%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3C%2Fsvg%3E\')] text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-white/10 bg-[url(\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill-opacity%3D%22.05%22%3E%3Crect%20x%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3Crect%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%2F%3E%3C%2Fsvg%3E\')] text-gray-600 dark:text-gray-300',
                    ]"
                  >
                    {{ t("vocabulary.transparent") }}
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
              @click="close"
              class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              {{ t("vocabulary.cancel") }}
            </button>
            <div class="flex-1"></div>
            <button
              type="button"
              @click="confirm"
              :disabled="!canConfirm"
              class="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{
                inputMode === "draw"
                  ? t("vocabulary.useDrawing")
                  : t("vocabulary.useKeyboard")
              }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useI18n } from "vue-i18n";
import { createWorker } from "tesseract.js";

const props = defineProps<{
  visible: boolean;
  word: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", payload: { imageDataUrl: string; word: string }): void;
}>();

const { t } = useI18n();

// Canvas refs
const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

// Input mode
const inputMode = ref<"draw" | "keyboard">("draw");

// Drawing state
const isDrawing = ref(false);
const hasDrawn = ref(false);
const brushSize = ref(5);
const brushColor = ref("#000000");
const currentTool = ref<"brush" | "eraser">("brush");
const canvasBackground = ref<"white" | "transparent">("white");
const previewDataUrl = ref("");
const wordText = ref("");

// OCR state
const isRecognizing = ref(false);
const ocrLanguage = ref("chi_sim");

// History for undo/redo
const history = ref<ImageData[]>([]);
const historyIndex = ref(-1);

// Keyboard state
const keyboardLanguage = ref<"english" | "chinese">("english");
const keyboardInputText = ref("");
const isShift = ref(false);
const selectedTone = ref<0 | 1 | 2 | 3 | 4>(0);

// Pinyin IME state
const pinyinBuffer = ref("");
const hanziCandidates = ref<string[]>([]);

// Pinyin to Hanzi dictionary (common characters)
const pinyinToHanzi: Record<string, string[]> = {
  // A
  a: ["啊", "阿", "呵", "嗄", "腌"],
  ai: ["爱", "哎", "唉", "埃", "挨", "矮", "癌", "艾", "碍", "隘"],
  an: ["安", "按", "暗", "岸", "案", "俺", "鞍", "氨", "庵", "谙"],
  ang: ["昂", "肮", "盎"],
  ao: ["奥", "凹", "熬", "翱", "袄", "傲", "遨", "澳", "懊", "鳌"],
  // B
  ba: ["八", "把", "吧", "爸", "拔", "罢", "霸", "疤", "芭", "扒"],
  bai: ["白", "百", "拜", "败", "摆", "柏", "掰", "佰", "稗"],
  ban: ["半", "办", "班", "版", "板", "般", "伴", "搬", "扮", "瓣"],
  bang: ["帮", "棒", "邦", "榜", "绑", "膀", "傍", "谤", "蚌", "镑"],
  bao: ["包", "报", "保", "抱", "宝", "饱", "暴", "爆", "薄", "胞"],
  bei: ["北", "背", "被", "杯", "备", "悲", "辈", "贝", "碑", "倍"],
  ben: ["本", "笨", "奔", "苯", "坌"],
  beng: ["崩", "绷", "蹦", "甭", "泵", "迸"],
  bi: ["比", "笔", "必", "鼻", "闭", "壁", "毕", "逼", "碧", "彼"],
  bian: ["边", "变", "便", "遍", "编", "辨", "辩", "扁", "贬", "鞭"],
  biao: ["表", "标", "彪", "膘", "镖", "裱", "飙", "婊"],
  bie: ["别", "憋", "瘪", "蹩", "鳖"],
  bin: ["宾", "滨", "彬", "斌", "濒", "殡", "膑", "摈", "缤", "槟"],
  bing: ["病", "冰", "并", "兵", "饼", "丙", "柄", "炳", "秉", "禀"],
  bo: ["波", "播", "伯", "勃", "博", "菠", "脖", "泊", "驳", "剥"],
  bu: ["不", "步", "布", "部", "补", "捕", "卜", "哺", "簿", "埠"],
  // C
  ca: ["擦", "嚓"],
  cai: ["才", "菜", "采", "财", "材", "彩", "裁", "猜", "踩", "睬"],
  can: ["参", "残", "餐", "蚕", "惨", "惭", "灿", "掺", "孱", "璨"],
  cang: ["藏", "仓", "沧", "苍", "舱", "伧"],
  cao: ["草", "操", "曹", "糟", "槽", "嘈", "漕"],
  ce: ["测", "策", "侧", "册", "厕"],
  cen: ["参", "岑", "涔"],
  ceng: ["层", "曾", "蹭", "噌"],
  cha: ["查", "茶", "差", "插", "察", "叉", "岔", "诧", "刹", "碴"],
  chai: ["拆", "柴", "豺", "差", "侪", "钗", "瘥"],
  chan: ["产", "缠", "禅", "蝉", "馋", "颤", "铲", "搀", "掺", "忏"],
  chang: ["长", "常", "场", "唱", "厂", "尝", "肠", "畅", "偿", "昌"],
  chao: ["超", "朝", "抄", "潮", "巢", "吵", "炒", "嘲", "钞"],
  che: ["车", "扯", "撤", "彻", "掣", "澈", "坼"],
  chen: ["陈", "称", "晨", "沉", "尘", "臣", "衬", "趁", "辰", "忱"],
  cheng: ["成", "城", "程", "称", "乘", "承", "诚", "呈", "橙", "撑"],
  chi: ["吃", "尺", "迟", "池", "齿", "持", "翅", "斥", "赤", "痴"],
  chong: ["重", "冲", "充", "虫", "崇", "宠", "忡", "憧", "舂"],
  chou: ["抽", "仇", "臭", "筹", "愁", "酬", "丑", "瞅", "绸", "稠"],
  chu: ["出", "初", "处", "除", "楚", "触", "储", "厨", "础", "畜"],
  chua: ["欻"],
  chuai: ["揣", "搋", "嘬", "踹", "膪"],
  chuan: ["传", "穿", "船", "川", "串", "喘", "椽", "遄", "舛"],
  chuang: ["创", "床", "窗", "闯", "幢", "疮"],
  chui: ["吹", "垂", "锤", "椎", "炊", "捶", "槌", "陲"],
  chun: ["春", "纯", "唇", "蠢", "醇", "淳", "椿", "鹑"],
  chuo: ["戳", "绰", "辍", "龊", "踔"],
  ci: ["此", "次", "词", "刺", "瓷", "慈", "辞", "磁", "雌", "茨"],
  cong: ["从", "聪", "丛", "葱", "囱", "淙", "琮", "璁"],
  cou: ["凑", "楱", "辏"],
  cu: ["粗", "促", "醋", "簇", "蹴", "徂", "殂"],
  cuan: ["蹿", "窜", "篡", "攒", "汆", "爨"],
  cui: ["催", "脆", "翠", "崔", "摧", "粹", "淬", "萃", "瘁", "悴"],
  cun: ["村", "存", "寸", "忖", "皴"],
  cuo: ["错", "搓", "挫", "措", "撮", "磋", "蹉", "痤"],
  // D
  da: ["大", "打", "达", "答", "搭", "瘩", "沓", "耷", "哒", "嗒"],
  dai: ["代", "带", "大", "待", "怠", "袋", "戴", "呆", "歹", "逮"],
  dan: ["但", "单", "担", "蛋", "淡", "弹", "胆", "旦", "诞", "丹"],
  dang: ["当", "党", "档", "挡", "荡", "宕", "砀", "菪"],
  dao: ["到", "道", "倒", "刀", "导", "岛", "悼", "盗", "稻", "捣"],
  de: ["的", "得", "德", "地"],
  dei: ["得"],
  den: ["扽"],
  deng: ["等", "登", "灯", "邓", "瞪", "凳", "蹬", "澄", "嶝", "磴"],
  di: ["地", "的", "第", "底", "低", "弟", "敌", "帝", "递", "抵"],
  dia: ["嗲"],
  dian: ["点", "电", "店", "典", "颠", "垫", "殿", "碘", "靛", "滇"],
  diao: ["掉", "调", "雕", "吊", "钓", "刁", "凋", "貂", "碉", "叼"],
  die: ["跌", "爹", "叠", "碟", "蝶", "迭", "谍", "牒", "堞", "瓞"],
  ding: ["定", "顶", "订", "丁", "盯", "钉", "鼎", "叮", "町", "仃"],
  diu: ["丢", "铥"],
  dong: ["东", "动", "冬", "懂", "洞", "冻", "栋", "侗", "咚", "峒"],
  dou: ["都", "斗", "豆", "抖", "兜", "陡", "痘", "窦", "蚪", "篼"],
  du: ["读", "度", "都", "独", "毒", "杜", "堵", "肚", "赌", "渡"],
  duan: ["段", "短", "断", "端", "锻", "椴", "缎", "煅"],
  dui: ["对", "队", "堆", "兑", "怼", "碓", "镦"],
  dun: ["顿", "吨", "敦", "蹲", "盾", "钝", "遁", "沌", "囤", "墩"],
  duo: ["多", "朵", "躲", "夺", "堕", "舵", "剁", "惰", "垛", "哆"],
  // E
  e: ["恶", "饿", "俄", "额", "鹅", "蛾", "峨", "娥", "厄", "扼"],
  ei: ["诶", "欸"],
  en: ["恩", "嗯", "摁"],
  eng: ["鞥"],
  er: ["二", "而", "耳", "儿", "尔", "饵", "洱", "珥", "铒"],
  // F
  fa: ["发", "法", "罚", "伐", "乏", "阀", "筏", "珐"],
  fan: ["反", "饭", "犯", "番", "翻", "烦", "凡", "泛", "帆", "藩"],
  fang: ["方", "放", "房", "防", "访", "仿", "芳", "坊", "妨", "纺"],
  fei: ["非", "飞", "费", "废", "肥", "肺", "匪", "诽", "吠", "沸"],
  fen: ["分", "份", "粉", "奋", "愤", "纷", "坟", "焚", "酚", "芬"],
  feng: ["风", "封", "丰", "峰", "锋", "蜂", "疯", "逢", "冯", "缝"],
  fo: ["佛"],
  fou: ["否", "缶"],
  fu: ["父", "服", "福", "府", "副", "复", "夫", "妇", "富", "付"],
  // G
  ga: ["嘎", "噶", "尬", "尕", "旮", "伽"],
  gai: ["该", "改", "盖", "概", "钙", "溉", "丐", "陔", "垓"],
  gan: ["干", "感", "敢", "赶", "甘", "肝", "杆", "竿", "柑", "尴"],
  gang: ["刚", "港", "钢", "岗", "纲", "缸", "杠", "扛", "冈", "肛"],
  gao: ["高", "搞", "告", "稿", "糕", "膏", "羔", "篙", "皋", "睾"],
  ge: ["个", "各", "哥", "歌", "格", "隔", "革", "割", "阁", "葛"],
  gei: ["给"],
  gen: ["根", "跟", "亘", "艮", "哏"],
  geng: ["更", "耕", "庚", "梗", "耿", "羹", "赓", "埂", "哽", "鲠"],
  gong: ["工", "公", "功", "共", "供", "攻", "宫", "恭", "弓", "躬"],
  gou: ["够", "狗", "沟", "钩", "勾", "购", "构", "垢", "苟", "篝"],
  gu: ["古", "故", "顾", "股", "骨", "姑", "鼓", "谷", "固", "雇"],
  gua: ["刮", "瓜", "挂", "寡", "卦", "呱", "剐", "褂", "胍"],
  guai: ["怪", "乖", "拐"],
  guan: ["关", "管", "官", "观", "馆", "冠", "惯", "贯", "灌", "罐"],
  guang: ["光", "广", "逛", "犷", "桄", "胱"],
  gui: ["归", "贵", "鬼", "桂", "轨", "柜", "圭", "硅", "龟", "闺"],
  gun: ["滚", "棍", "辊", "衮", "磙", "鲧"],
  guo: ["过", "国", "果", "锅", "裹", "郭", "涡", "帼", "虢", "掴"],
  // H
  ha: ["哈", "蛤", "铪"],
  hai: ["还", "海", "害", "孩", "嗨", "氦", "骸", "骇", "亥", "醢"],
  han: ["汉", "寒", "含", "喊", "韩", "罕", "汗", "旱", "函", "憾"],
  hang: ["行", "航", "杭", "巷", "夯", "吭", "绗", "沆"],
  hao: ["好", "号", "毫", "豪", "耗", "浩", "郝", "皓", "蒿", "嚎"],
  he: ["和", "何", "河", "合", "喝", "核", "贺", "吓", "呵", "荷"],
  hei: ["黑", "嘿", "嗨"],
  hen: ["很", "狠", "恨", "痕", "亨"],
  heng: ["横", "恒", "衡", "哼", "亨", "珩", "桁", "蘅"],
  hong: ["红", "洪", "虹", "宏", "轰", "鸿", "弘", "哄", "烘", "泓"],
  hou: ["后", "候", "厚", "猴", "吼", "喉", "侯", "逅", "堠", "骺"],
  hu: ["和", "护", "户", "呼", "湖", "虎", "胡", "互", "忽", "乎"],
  hua: ["话", "花", "画", "化", "华", "滑", "划", "哗", "骅", "猾"],
  huai: ["坏", "怀", "淮", "槐", "踝", "徊"],
  huan: ["还", "换", "环", "欢", "患", "缓", "幻", "唤", "焕", "宦"],
  huang: ["黄", "皇", "慌", "晃", "荒", "惶", "煌", "蝗", "簧", "璜"],
  hui: ["会", "回", "汇", "辉", "灰", "挥", "绘", "惠", "毁", "悔"],
  hun: ["婚", "混", "魂", "浑", "昏", "荤", "诨", "馄", "阍"],
  huo: ["活", "火", "或", "货", "获", "祸", "惑", "霍", "豁", "和"],
  // J
  ji: ["几", "机", "及", "级", "急", "己", "集", "基", "记", "计"],
  jia: ["家", "加", "假", "价", "甲", "嘉", "佳", "夹", "架", "驾"],
  jian: ["见", "间", "建", "件", "简", "减", "肩", "检", "监", "坚"],
  jiang: ["将", "讲", "江", "奖", "降", "酱", "浆", "姜", "疆", "僵"],
  jiao: ["叫", "教", "交", "脚", "角", "觉", "较", "焦", "骄", "胶"],
  jie: ["就", "结", "接", "节", "街", "解", "介", "姐", "界", "戒"],
  jin: ["进", "近", "今", "金", "仅", "紧", "尽", "禁", "劲", "晋"],
  jing: ["经", "精", "京", "静", "镜", "景", "境", "竞", "井", "净"],
  jiong: ["窘", "炯", "迥", "扃", "囧"],
  jiu: ["就", "九", "久", "酒", "旧", "救", "究", "纠", "揪", "韭"],
  ju: ["就", "局", "举", "句", "具", "据", "距", "巨", "拒", "聚"],
  juan: ["卷", "捐", "倦", "娟", "绢", "鹃", "眷", "隽", "蠲", "锩"],
  jue: ["觉", "决", "绝", "角", "掘", "爵", "嚼", "倔", "脚", "诀"],
  jun: ["军", "均", "君", "俊", "峻", "菌", "骏", "郡", "筠", "钧"],
  // K
  ka: ["卡", "咖", "喀", "咔", "胩"],
  kai: ["开", "凯", "楷", "慨", "揩", "锴", "铠", "忾"],
  kan: ["看", "砍", "坎", "堪", "刊", "侃", "瞰", "勘", "龛", "阚"],
  kang: ["康", "抗", "扛", "炕", "亢", "糠", "慷", "闶"],
  kao: ["考", "靠", "烤", "拷", "铐", "犒", "尻"],
  ke: ["可", "科", "课", "客", "刻", "克", "颗", "壳", "渴", "咳"],
  ken: ["肯", "啃", "恳", "垦", "龈", "裉"],
  keng: ["坑", "吭", "铿"],
  kong: ["空", "孔", "控", "恐", "倥", "崆", "箜"],
  kou: ["口", "扣", "抠", "寇", "蔻", "叩", "芤", "眍"],
  ku: ["苦", "哭", "库", "裤", "枯", "酷", "窟", "骷", "刳", "堀"],
  kua: ["跨", "夸", "垮", "挎", "胯"],
  kuai: ["快", "块", "筷", "会", "脍", "蒯", "侩", "浍", "哙"],
  kuan: ["宽", "款", "髋"],
  kuang: ["况", "框", "矿", "狂", "眶", "旷", "筐", "圹", "诳", "邝"],
  kui: ["亏", "愧", "奎", "葵", "魁", "傀", "馈", "溃", "窥", "盔"],
  kun: ["昆", "困", "捆", "坤", "鲲", "锟", "髡", "悃", "阃", "醌"],
  kuo: ["括", "扩", "阔", "廓", "蛞", "适"],
  // L
  la: ["拉", "啦", "辣", "蜡", "腊", "喇", "剌", "落", "垃", "邋"],
  lai: ["来", "赖", "莱", "睐", "濑", "赉", "徕", "涞", "籁"],
  lan: ["蓝", "兰", "烂", "拦", "懒", "栏", "揽", "澜", "览", "滥"],
  lang: ["浪", "朗", "郎", "狼", "廊", "琅", "榔", "锒", "稂", "阆"],
  lao: ["老", "劳", "牢", "捞", "烙", "姥", "涝", "酪", "佬", "铑"],
  le: ["了", "乐", "勒", "肋", "仂", "叻", "泐", "鳓"],
  lei: ["类", "累", "泪", "雷", "蕾", "磊", "擂", "垒", "镭", "羸"],
  leng: ["冷", "楞", "愣", "棱"],
  li: ["里", "理", "力", "利", "立", "例", "离", "李", "礼", "历"],
  lia: ["俩"],
  lian: ["连", "脸", "联", "练", "炼", "莲", "恋", "链", "帘", "廉"],
  liang: ["两", "量", "亮", "凉", "良", "梁", "粮", "辆", "晾", "谅"],
  liao: ["了", "料", "聊", "疗", "辽", "燎", "撩", "寥", "僚", "潦"],
  lie: ["列", "烈", "裂", "劣", "猎", "咧", "趔", "冽", "埒", "捩"],
  lin: ["临", "林", "淋", "吝", "邻", "磷", "鳞", "琳", "霖", "遴"],
  ling: ["领", "另", "令", "灵", "零", "龄", "凌", "铃", "玲", "陵"],
  liu: ["六", "流", "留", "刘", "柳", "溜", "硫", "馏", "瘤", "浏"],
  lo: ["咯"],
  long: ["龙", "隆", "笼", "聋", "拢", "弄", "垄", "珑", "陇", "胧"],
  lou: ["楼", "漏", "露", "陋", "搂", "篓", "娄", "喽", "蝼", "髅"],
  lu: ["路", "陆", "录", "露", "鹿", "卢", "芦", "炉", "鲁", "庐"],
  lv: ["绿", "率", "律", "旅", "虑", "铝", "屡", "滤", "驴", "吕"],
  luan: ["乱", "卵", "孪", "滦", "峦", "銮", "挛", "鸾", "栾"],
  lue: ["略", "掠", "锊"],
  lun: ["论", "轮", "伦", "沦", "抡", "囵", "纶"],
  luo: ["落", "罗", "洛", "络", "裸", "骡", "螺", "锣", "萝", "逻"],
  // M
  ma: ["吗", "妈", "马", "麻", "骂", "码", "蚂", "玛", "嘛", "抹"],
  mai: ["买", "卖", "麦", "迈", "埋", "脉", "霾"],
  man: ["满", "慢", "漫", "曼", "蛮", "馒", "瞒", "蔓", "谩", "幔"],
  mang: ["忙", "盲", "茫", "芒", "莽", "蟒", "邙", "氓", "硭"],
  mao: ["毛", "帽", "猫", "冒", "貌", "茂", "矛", "茅", "锚", "卯"],
  me: ["么", "麽", "嚜"],
  mei: ["没", "美", "每", "妹", "眉", "梅", "煤", "霉", "媒", "枚"],
  men: ["们", "门", "闷", "焖", "钔", "扪"],
  meng: ["梦", "猛", "蒙", "孟", "萌", "盟", "朦", "檬", "锰", "甍"],
  mi: ["米", "密", "迷", "秘", "蜜", "眯", "谜", "弥", "糜", "靡"],
  mian: ["面", "棉", "免", "眠", "绵", "缅", "勉", "冕", "娩", "腼"],
  miao: ["秒", "苗", "妙", "描", "庙", "瞄", "渺", "喵", "淼", "藐"],
  mie: ["灭", "蔑", "咩", "蠛", "篾"],
  min: ["民", "敏", "闽", "悯", "珉", "抿", "皿", "愍", "泯", "苠"],
  ming: ["明", "名", "命", "鸣", "铭", "冥", "螟", "暝", "瞑", "溟"],
  miu: ["谬", "缪"],
  mo: ["没", "末", "莫", "默", "磨", "模", "摸", "膜", "墨", "魔"],
  mou: ["某", "谋", "牟", "眸", "侔", "哞", "蛑", "缪"],
  mu: ["目", "母", "木", "牧", "暮", "墓", "幕", "慕", "亩", "穆"],
  // N
  na: ["那", "拿", "哪", "呐", "纳", "娜", "捺", "钠", "镎"],
  nai: ["乃", "奶", "耐", "奈", "氖", "艿", "萘", "鼐"],
  nan: ["南", "难", "男", "楠", "喃", "蝻", "赧", "腩"],
  nang: ["囊", "馕", "曩", "囔", "攮"],
  nao: ["脑", "闹", "恼", "挠", "瑙", "淖", "孬", "垴", "铙", "蛲"],
  ne: ["呢", "讷", "哪"],
  nei: ["内", "那", "馁"],
  nen: ["嫩", "恁"],
  neng: ["能"],
  ni: ["你", "泥", "尼", "逆", "拟", "腻", "匿", "霓", "妮", "倪"],
  nian: ["年", "念", "粘", "拈", "碾", "撵", "蔫", "鲇", "辇", "黏"],
  niang: ["娘", "酿"],
  niao: ["鸟", "尿", "袅", "嬲", "脲"],
  nie: ["捏", "涅", "聂", "孽", "啮", "镊", "镍", "嗫", "蹑", "臬"],
  nin: ["您", "囜"],
  ning: ["宁", "凝", "拧", "柠", "宁", "泞", "甯", "狞", "佞", "咛"],
  niu: ["牛", "扭", "纽", "钮", "妞", "拗", "忸", "狃"],
  nong: ["农", "弄", "浓", "脓", "侬", "哝", "秾", "耨"],
  nou: ["耨"],
  nu: ["女", "努", "怒", "奴", "弩", "胬", "孥", "驽"],
  nv: ["女"],
  nuan: ["暖"],
  nue: ["虐", "疟", "谑"],
  nuo: ["诺", "挪", "糯", "懦", "傩", "喏", "锘"],
  // O
  o: ["哦", "噢", "喔"],
  ou: ["偶", "欧", "殴", "鸥", "呕", "沤", "藕", "瓯", "讴", "怄"],
  // P
  pa: ["怕", "爬", "帕", "趴", "扒", "琶", "啪", "葩", "耙", "杷"],
  pai: ["排", "派", "拍", "牌", "徘", "湃", "俳", "蒎"],
  pan: ["盘", "判", "盼", "潘", "攀", "畔", "叛", "胖", "磐", "蟠"],
  pang: ["旁", "胖", "庞", "膀", "耪", "滂", "逄", "螃"],
  pao: ["跑", "炮", "抛", "泡", "袍", "刨", "咆", "疱", "庖", "匏"],
  pei: ["配", "陪", "佩", "培", "赔", "沛", "裴", "呸", "胚", "醅"],
  pen: ["喷", "盆", "湓"],
  peng: ["朋", "碰", "彭", "蓬", "棚", "篷", "膨", "鹏", "捧", "烹"],
  pi: ["皮", "批", "疲", "屁", "劈", "披", "脾", "啤", "匹", "痞"],
  pian: ["片", "篇", "偏", "骗", "翩", "扁", "胼", "蹁", "谝", "犏"],
  piao: ["票", "漂", "飘", "瓢", "嫖", "缥", "嘌", "剽", "螵", "骠"],
  pie: ["撇", "瞥", "苤", "氕"],
  pin: ["品", "拼", "贫", "频", "聘", "姘", "嫔", "榀", "牝", "颦"],
  ping: ["平", "评", "瓶", "凭", "屏", "萍", "苹", "坪", "冯", "娉"],
  po: ["破", "坡", "泼", "颇", "婆", "迫", "魄", "粕", "鄱", "叵"],
  pou: ["剖", "掊", "抔", "裒", "踣"],
  pu: ["普", "铺", "扑", "朴", "谱", "浦", "埔", "仆", "蒲", "葡"],
  // Q
  qi: ["起", "其", "期", "气", "七", "器", "奇", "齐", "企", "妻"],
  qia: ["恰", "卡", "洽", "掐", "髂"],
  qian: ["前", "千", "钱", "签", "牵", "欠", "浅", "潜", "迁", "谦"],
  qiang: ["强", "枪", "墙", "抢", "腔", "呛", "羌", "戕", "嫱", "樯"],
  qiao: ["桥", "巧", "敲", "瞧", "悄", "翘", "俏", "窍", "侨", "乔"],
  qie: ["切", "且", "怯", "窃", "茄", "妾", "挈", "惬", "锲", "箧"],
  qin: ["亲", "琴", "勤", "侵", "秦", "钦", "芹", "寝", "禽", "擒"],
  qing: ["请", "情", "清", "青", "轻", "庆", "倾", "晴", "氢", "擎"],
  qiong: ["穷", "琼", "邛", "茕", "筇", "跫", "蛩", "銎"],
  qiu: ["求", "球", "秋", "邱", "丘", "囚", "酋", "裘", "蚯", "虬"],
  qu: ["去", "区", "取", "趣", "曲", "娶", "渠", "驱", "屈", "躯"],
  quan: ["全", "权", "圈", "拳", "犬", "劝", "泉", "颧", "诠", "荃"],
  que: ["却", "确", "缺", "雀", "瘸", "阙", "鹊", "榷", "炔", "阕"],
  qun: ["群", "裙", "逡", "麇"],
  // R
  ran: ["然", "染", "燃", "冉", "苒", "髯", "蚺"],
  rang: ["让", "嚷", "壤", "攘", "瓤", "禳"],
  rao: ["绕", "饶", "扰", "娆", "荛", "桡"],
  re: ["热", "惹", "若"],
  ren: ["人", "任", "认", "仁", "忍", "刃", "韧", "壬", "纫", "荏"],
  reng: ["扔", "仍", "礽"],
  ri: ["日"],
  rong: ["容", "融", "荣", "溶", "熔", "绒", "蓉", "戎", "榕", "冗"],
  rou: ["肉", "柔", "揉", "蹂", "糅", "鞣"],
  ru: ["如", "入", "乳", "儒", "褥", "辱", "茹", "蠕", "嚅", "孺"],
  ruan: ["软", "阮", "朊"],
  rui: ["瑞", "锐", "睿", "芮", "蕊", "蕤", "枘"],
  run: ["润", "闰", "蠕"],
  ruo: ["若", "弱", "偌", "箬"],
  // S
  sa: ["撒", "洒", "萨", "飒", "仨", "卅", "脎"],
  sai: ["赛", "塞", "腮", "鳃", "噻"],
  san: ["三", "散", "伞", "叁", "馓", "毵"],
  sang: ["嗓", "桑", "丧", "搡", "颡", "磉"],
  sao: ["扫", "嫂", "骚", "搔", "臊", "梢", "鳋", "瘙"],
  se: ["色", "瑟", "涩", "塞", "啬", "穑", "铯"],
  sen: ["森", "参"],
  seng: ["僧"],
  sha: ["杀", "沙", "啥", "纱", "傻", "厦", "煞", "莎", "砂", "霎"],
  shai: ["晒", "筛", "色"],
  shan: ["山", "善", "闪", "扇", "杉", "删", "煽", "珊", "擅", "赡"],
  shang: ["上", "商", "伤", "尚", "赏", "汤", "裳", "晌", "墒", "觞"],
  shao: ["少", "烧", "绍", "哨", "勺", "邵", "稍", "韶", "捎", "梢"],
  she: ["社", "设", "射", "舌", "蛇", "涉", "摄", "赦", "舍", "奢"],
  shei: ["谁"],
  shen: ["什", "身", "神", "深", "申", "伸", "审", "沈", "甚", "渗"],
  sheng: ["生", "声", "省", "胜", "盛", "圣", "剩", "升", "绳", "牲"],
  shi: ["是", "时", "事", "十", "使", "市", "世", "识", "实", "始"],
  shou: ["手", "受", "首", "收", "守", "寿", "授", "售", "瘦", "兽"],
  shu: ["书", "数", "树", "属", "术", "输", "束", "熟", "述", "殊"],
  shua: ["刷", "耍", "唰"],
  shuai: ["帅", "摔", "甩", "衰", "蟀"],
  shuan: ["拴", "栓", "涮", "闩"],
  shuang: ["双", "爽", "霜", "孀", "泷"],
  shui: ["水", "睡", "谁", "税", "说"],
  shun: ["顺", "舜", "瞬", "吮", "蕣"],
  shuo: ["说", "硕", "朔", "烁", "铄", "蒴", "搠", "妁", "槊"],
  si: ["四", "死", "思", "私", "司", "似", "丝", "斯", "撕", "寺"],
  song: ["送", "松", "宋", "诵", "颂", "耸", "嵩", "讼", "怂", "悚"],
  sou: ["搜", "艘", "嗖", "叟", "嗽", "馊", "飕", "瞍", "溲", "锼"],
  su: ["苏", "速", "素", "诉", "宿", "塑", "俗", "酥", "肃", "溯"],
  suan: ["算", "酸", "蒜", "狻"],
  sui: ["随", "岁", "虽", "碎", "遂", "隧", "穗", "髓", "祟", "眭"],
  sun: ["孙", "损", "笋", "荪", "狲", "隼", "飧"],
  suo: ["所", "锁", "缩", "索", "梭", "唢", "蓑", "娑", "嗦", "琐"],
  // T
  ta: ["他", "她", "它", "踏", "塔", "拓", "挞", "遢", "沓", "榻"],
  tai: ["太", "台", "态", "抬", "泰", "胎", "苔", "酞", "邰", "汰"],
  tan: ["谈", "探", "弹", "炭", "滩", "坦", "摊", "叹", "毯", "潭"],
  tang: ["唐", "堂", "糖", "汤", "躺", "趟", "塘", "烫", "棠", "膛"],
  tao: ["套", "桃", "逃", "讨", "淘", "陶", "掏", "涛", "萄", "滔"],
  te: ["特", "忑", "铽"],
  teng: ["疼", "腾", "藤", "誊", "滕"],
  ti: ["体", "题", "提", "替", "踢", "梯", "剃", "涕", "啼", "蹄"],
  tian: ["天", "田", "甜", "填", "添", "舔", "恬", "腆", "掭", "殄"],
  tiao: ["条", "跳", "挑", "调", "苕", "窕", "粜", "髫", "祧", "蜩"],
  tie: ["铁", "帖", "贴", "餮"],
  ting: ["听", "停", "挺", "庭", "厅", "亭", "艇", "廷", "汀", "霆"],
  tong: ["同", "通", "统", "痛", "铜", "童", "桶", "筒", "捅", "桐"],
  tou: ["头", "透", "偷", "投", "骰", "钭"],
  tu: ["图", "土", "吐", "突", "涂", "徒", "兔", "途", "屠", "秃"],
  tuan: ["团", "湍", "抟", "疃", "彖"],
  tui: ["推", "腿", "退", "蜕", "褪", "颓", "煺"],
  tun: ["吞", "屯", "囤", "褪", "臀", "豚", "饨", "暾"],
  tuo: ["拖", "脱", "托", "妥", "驮", "陀", "唾", "椭", "驼", "坨"],
  // W
  wa: ["挖", "哇", "娃", "瓦", "蛙", "袜", "佤", "洼", "娲", "腽"],
  wai: ["外", "歪", "崴"],
  wan: ["万", "完", "晚", "玩", "弯", "碗", "湾", "丸", "挽", "婉"],
  wang: ["王", "往", "望", "网", "忘", "亡", "汪", "旺", "枉", "妄"],
  wei: ["为", "位", "未", "维", "围", "伟", "微", "卫", "味", "威"],
  wen: ["问", "文", "闻", "稳", "温", "吻", "纹", "蚊", "瘟", "紊"],
  weng: ["翁", "嗡", "瓮", "蓊"],
  wo: ["我", "窝", "卧", "握", "沃", "蜗", "涡", "斡", "倭", "莴"],
  wu: ["五", "无", "物", "务", "武", "午", "屋", "雾", "舞", "误"],
  // X
  xi: ["西", "息", "系", "希", "细", "习", "喜", "戏", "洗", "吸"],
  xia: ["下", "夏", "吓", "虾", "峡", "霞", "瞎", "侠", "狭", "暇"],
  xian: ["先", "现", "线", "限", "县", "显", "险", "鲜", "闲", "嫌"],
  xiang: ["想", "向", "像", "响", "相", "香", "乡", "箱", "详", "享"],
  xiao: ["小", "笑", "校", "消", "效", "销", "晓", "萧", "肖", "削"],
  xie: ["些", "写", "谢", "协", "斜", "鞋", "血", "携", "歇", "泄"],
  xin: ["心", "新", "信", "辛", "欣", "薪", "芯", "锌", "鑫", "馨"],
  xing: ["行", "性", "型", "星", "形", "兴", "姓", "醒", "幸", "杏"],
  xiong: ["雄", "胸", "熊", "兄", "凶", "匈", "汹", "芎"],
  xiu: ["修", "休", "秀", "绣", "袖", "嗅", "锈", "羞", "宿", "朽"],
  xu: ["需", "许", "续", "须", "序", "徐", "虚", "叙", "畜", "蓄"],
  xuan: ["选", "宣", "旋", "悬", "玄", "轩", "喧", "眩", "绚", "炫"],
  xue: ["学", "雪", "血", "穴", "削", "靴", "薛", "噱", "踅", "鳕"],
  xun: ["训", "讯", "寻", "询", "循", "巡", "殉", "熏", "旬", "逊"],
  // Y
  ya: ["呀", "压", "牙", "亚", "雅", "鸭", "崖", "芽", "丫", "涯"],
  yan: ["眼", "研", "言", "严", "烟", "盐", "沿", "演", "颜", "验"],
  yang: ["样", "阳", "养", "央", "洋", "扬", "杨", "羊", "仰", "痒"],
  yao: ["要", "药", "摇", "遥", "咬", "腰", "妖", "窑", "邀", "耀"],
  ye: ["也", "业", "夜", "叶", "野", "爷", "页", "液", "冶", "噎"],
  yi: ["一", "以", "已", "意", "义", "衣", "医", "宜", "移", "易"],
  yin: ["因", "音", "银", "印", "引", "饮", "阴", "隐", "尹", "殷"],
  ying: ["应", "影", "英", "营", "迎", "硬", "映", "盈", "赢", "蝇"],
  yo: ["哟", "唷"],
  yong: ["用", "永", "拥", "勇", "涌", "庸", "泳", "踊", "佣", "咏"],
  you: ["有", "又", "由", "右", "油", "友", "游", "优", "幽", "尤"],
  yu: ["与", "于", "鱼", "语", "雨", "玉", "遇", "预", "育", "余"],
  yuan: ["远", "院", "员", "原", "园", "源", "元", "愿", "圆", "缘"],
  yue: ["月", "越", "约", "跃", "乐", "岳", "悦", "阅", "粤", "钥"],
  yun: ["云", "运", "允", "韵", "孕", "晕", "蕴", "酝", "匀", "陨"],
  // Z
  za: ["杂", "咋", "砸", "咂", "匝", "咋", "拶"],
  zai: ["在", "再", "载", "仔", "灾", "宰", "栽", "哉", "崽"],
  zan: ["赞", "咱", "暂", "攒", "瓒", "簪", "糌", "趱"],
  zang: ["脏", "葬", "藏", "赃", "臧", "奘", "驵"],
  zao: ["早", "造", "遭", "糟", "枣", "灶", "皂", "凿", "藻", "躁"],
  ze: ["则", "责", "择", "泽", "仄", "啧", "帻", "箦", "赜", "迮"],
  zei: ["贼"],
  zen: ["怎", "谮"],
  zeng: ["增", "曾", "赠", "憎", "锃", "甑", "罾"],
  zha: ["扎", "炸", "渣", "闸", "眨", "榨", "诈", "乍", "札", "轧"],
  zhai: ["窄", "债", "摘", "宅", "斋", "寨", "翟", "瘵"],
  zhan: ["站", "战", "占", "展", "沾", "粘", "斩", "盏", "绽", "崭"],
  zhang: ["长", "张", "章", "掌", "账", "丈", "仗", "涨", "障", "杖"],
  zhao: ["找", "照", "招", "朝", "着", "召", "兆", "赵", "沼", "罩"],
  zhe: ["这", "着", "者", "折", "哲", "遮", "浙", "辙", "蔗", "蛰"],
  zhei: ["这"],
  zhen: ["真", "针", "镇", "阵", "震", "诊", "珍", "枕", "振", "侦"],
  zheng: ["正", "整", "政", "证", "争", "挣", "郑", "症", "征", "蒸"],
  zhi: ["之", "只", "知", "至", "直", "指", "纸", "支", "制", "值"],
  zhong: ["中", "种", "重", "终", "众", "钟", "忠", "肿", "仲", "衷"],
  zhou: ["周", "州", "洲", "粥", "轴", "皱", "舟", "宙", "骤", "肘"],
  zhu: ["主", "住", "注", "助", "祝", "著", "猪", "朱", "竹", "铸"],
  zhua: ["抓", "挝", "爪"],
  zhuai: ["拽", "转"],
  zhuan: ["转", "专", "传", "赚", "砖", "撰", "篆", "馔", "啭"],
  zhuang: ["装", "状", "撞", "庄", "壮", "幢", "妆", "桩"],
  zhui: ["追", "坠", "缀", "椎", "锥", "赘", "惴", "骓"],
  zhun: ["准", "谆", "肫", "窀"],
  zhuo: ["着", "桌", "捉", "琢", "卓", "拙", "灼", "浊", "酌", "啄"],
  zi: ["子", "自", "字", "紫", "资", "仔", "滋", "姿", "咨", "籽"],
  zong: ["总", "纵", "宗", "综", "棕", "踪", "粽", "鬃", "偬"],
  zou: ["走", "奏", "邹", "揍", "诹", "鄹", "陬", "驺"],
  zu: ["组", "族", "租", "足", "阻", "卒", "祖", "诅", "俎", "镞"],
  zuan: ["钻", "纂", "躜", "攥", "缵"],
  zui: ["最", "嘴", "醉", "罪", "蕞", "觜"],
  zun: ["尊", "遵", "撙", "樽", "鳟"],
  zuo: ["做", "作", "坐", "座", "左", "昨", "凿", "琢", "唑", "嘬"],
};

// Tone options for Chinese Pinyin
const toneOptions = [
  { value: 0 as const, label: "—", name: "No tone (neutral)" },
  { value: 1 as const, label: "ˉ", name: "1st tone (flat)" },
  { value: 2 as const, label: "ˊ", name: "2nd tone (rising)" },
  { value: 3 as const, label: "ˇ", name: "3rd tone (dipping)" },
  { value: 4 as const, label: "ˋ", name: "4th tone (falling)" },
];

// Pinyin vowels with tones
const pinyinTones: Record<string, string[]> = {
  a: ["a", "ā", "á", "ǎ", "à"],
  e: ["e", "ē", "é", "ě", "è"],
  i: ["i", "ī", "í", "ǐ", "ì"],
  o: ["o", "ō", "ó", "ǒ", "ò"],
  u: ["u", "ū", "ú", "ǔ", "ù"],
  v: ["ü", "ǖ", "ǘ", "ǚ", "ǜ"], // ü is often typed as v
};

// Keyboard interface
interface KeyboardKey {
  value: string;
  label: string;
  type: "normal" | "special" | "vowel" | "consonant";
}

// English keyboard layout
const englishKeyboardRows: KeyboardKey[][] = [
  [
    { value: "q", label: "Q", type: "normal" },
    { value: "w", label: "W", type: "normal" },
    { value: "e", label: "E", type: "normal" },
    { value: "r", label: "R", type: "normal" },
    { value: "t", label: "T", type: "normal" },
    { value: "y", label: "Y", type: "normal" },
    { value: "u", label: "U", type: "normal" },
    { value: "i", label: "I", type: "normal" },
    { value: "o", label: "O", type: "normal" },
    { value: "p", label: "P", type: "normal" },
  ],
  [
    { value: "a", label: "A", type: "normal" },
    { value: "s", label: "S", type: "normal" },
    { value: "d", label: "D", type: "normal" },
    { value: "f", label: "F", type: "normal" },
    { value: "g", label: "G", type: "normal" },
    { value: "h", label: "H", type: "normal" },
    { value: "j", label: "J", type: "normal" },
    { value: "k", label: "K", type: "normal" },
    { value: "l", label: "L", type: "normal" },
  ],
  [
    { value: "z", label: "Z", type: "normal" },
    { value: "x", label: "X", type: "normal" },
    { value: "c", label: "C", type: "normal" },
    { value: "v", label: "V", type: "normal" },
    { value: "b", label: "B", type: "normal" },
    { value: "n", label: "N", type: "normal" },
    { value: "m", label: "M", type: "normal" },
    { value: "backspace", label: "⌫", type: "special" },
  ],
  [{ value: "space", label: "Space", type: "special" }],
];

// Chinese Pinyin keyboard layout
const chinesePinyinRows: KeyboardKey[][] = [
  [
    { value: "q", label: "q", type: "consonant" },
    { value: "w", label: "w", type: "consonant" },
    { value: "e", label: "e", type: "vowel" },
    { value: "r", label: "r", type: "consonant" },
    { value: "t", label: "t", type: "consonant" },
    { value: "y", label: "y", type: "consonant" },
    { value: "u", label: "u", type: "vowel" },
    { value: "i", label: "i", type: "vowel" },
    { value: "o", label: "o", type: "vowel" },
    { value: "p", label: "p", type: "consonant" },
  ],
  [
    { value: "a", label: "a", type: "vowel" },
    { value: "s", label: "s", type: "consonant" },
    { value: "d", label: "d", type: "consonant" },
    { value: "f", label: "f", type: "consonant" },
    { value: "g", label: "g", type: "consonant" },
    { value: "h", label: "h", type: "consonant" },
    { value: "j", label: "j", type: "consonant" },
    { value: "k", label: "k", type: "consonant" },
    { value: "l", label: "l", type: "consonant" },
  ],
  [
    { value: "z", label: "z", type: "consonant" },
    { value: "x", label: "x", type: "consonant" },
    { value: "c", label: "c", type: "consonant" },
    { value: "v", label: "ü", type: "vowel" },
    { value: "b", label: "b", type: "consonant" },
    { value: "n", label: "n", type: "consonant" },
    { value: "m", label: "m", type: "consonant" },
    { value: "backspace", label: "⌫", type: "special" },
  ],
  [{ value: "space", label: "Space", type: "special" }],
];

// Color palette
const colorPalette = [
  "#000000", // Black
  "#FFFFFF", // White
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

// Keyboard handlers
const handleKeyPress = (key: KeyboardKey) => {
  if (key.value === "backspace") {
    keyboardInputText.value = keyboardInputText.value.slice(0, -1);
  } else if (key.value === "space") {
    keyboardInputText.value += " ";
  } else {
    const char = isShift.value
      ? key.label.toUpperCase()
      : key.label.toLowerCase();
    keyboardInputText.value += char;
  }
};

const handlePinyinKeyPress = (key: KeyboardKey) => {
  if (key.value === "backspace") {
    // First try to delete from pinyin buffer, then from main text
    if (pinyinBuffer.value.length > 0) {
      pinyinBuffer.value = pinyinBuffer.value.slice(0, -1);
      updateHanziCandidates();
    } else {
      keyboardInputText.value = keyboardInputText.value.slice(0, -1);
    }
  } else if (key.value === "space") {
    // If pinyin buffer has content, select first candidate or add pinyin
    if (pinyinBuffer.value && hanziCandidates.value.length > 0) {
      selectHanzi(hanziCandidates.value[0]);
    } else if (pinyinBuffer.value) {
      // No candidates, add pinyin as-is
      keyboardInputText.value += pinyinBuffer.value;
      pinyinBuffer.value = "";
      hanziCandidates.value = [];
      selectedTone.value = 0; // Reset tone
    } else {
      keyboardInputText.value += " ";
    }
  } else if (key.type === "vowel" && selectedTone.value > 0) {
    // Apply tone to vowel and add to buffer
    const vowelKey = key.value === "v" ? "v" : key.value;
    const tones = pinyinTones[vowelKey];
    if (tones) {
      pinyinBuffer.value += tones[selectedTone.value];
    } else {
      pinyinBuffer.value += key.label;
    }
    updateHanziCandidates();
  } else {
    // Add to pinyin buffer
    pinyinBuffer.value += key.label;
    updateHanziCandidates();
  }
};

// Map to convert toned vowels to base vowels for dictionary lookup
const tonedToBaseMap: Record<string, string> = {
  ā: "a",
  á: "a",
  ǎ: "a",
  à: "a",
  ē: "e",
  é: "e",
  ě: "e",
  è: "e",
  ī: "i",
  í: "i",
  ǐ: "i",
  ì: "i",
  ō: "o",
  ó: "o",
  ǒ: "o",
  ò: "o",
  ū: "u",
  ú: "u",
  ǔ: "u",
  ù: "u",
  ǖ: "v",
  ǘ: "v",
  ǚ: "v",
  ǜ: "v",
  ü: "v",
};

// Normalize toned pinyin to base pinyin for dictionary lookup
const normalizePinyin = (pinyin: string): string => {
  let result = "";
  for (const char of pinyin) {
    result += tonedToBaseMap[char] || char;
  }
  return result;
};

// Update hanzi candidates based on pinyin buffer
const updateHanziCandidates = () => {
  const rawPinyin = pinyinBuffer.value.toLowerCase();
  if (!rawPinyin) {
    hanziCandidates.value = [];
    return;
  }

  // Normalize toned pinyin to base pinyin for dictionary lookup
  const pinyin = normalizePinyin(rawPinyin);

  // Direct match
  if (pinyinToHanzi[pinyin]) {
    hanziCandidates.value = pinyinToHanzi[pinyin].slice(0, 10);
    return;
  }

  // No direct match, try prefix matching
  const matches: string[] = [];
  for (const [py, chars] of Object.entries(pinyinToHanzi)) {
    if (py.startsWith(pinyin)) {
      matches.push(...chars.slice(0, 3));
      if (matches.length >= 10) break;
    }
  }
  hanziCandidates.value = matches.slice(0, 10);
};

// Select a hanzi character
const selectHanzi = (char: string) => {
  keyboardInputText.value += char;
  pinyinBuffer.value = "";
  hanziCandidates.value = [];
  selectedTone.value = 0; // Reset tone for next input
};

// Clear pinyin buffer
const clearPinyinBuffer = () => {
  pinyinBuffer.value = "";
  hanziCandidates.value = [];
  selectedTone.value = 0; // Reset tone
};

const insertCharacter = (char: string) => {
  keyboardInputText.value += char;
  selectedTone.value = 0; // Reset tone
};

const getTonedVowels = (): string[] => {
  const tone = selectedTone.value;
  if (tone === 0) {
    return ["a", "e", "i", "o", "u", "ü"];
  }
  return [
    pinyinTones.a[tone],
    pinyinTones.e[tone],
    pinyinTones.i[tone],
    pinyinTones.o[tone],
    pinyinTones.u[tone],
    pinyinTones.v[tone],
  ];
};

// Map toned vowels back to base vowels
const tonedVowelToBase: Record<string, string> = {
  // a tones
  ā: "a",
  á: "a",
  ǎ: "a",
  à: "a",
  // e tones
  ē: "e",
  é: "e",
  ě: "e",
  è: "e",
  // i tones
  ī: "i",
  í: "i",
  ǐ: "i",
  ì: "i",
  // o tones
  ō: "o",
  ó: "o",
  ǒ: "o",
  ò: "o",
  // u tones
  ū: "u",
  ú: "u",
  ǔ: "u",
  ù: "u",
  // ü tones
  ǖ: "v",
  ǘ: "v",
  ǚ: "v",
  ǜ: "v",
  ü: "v",
};

// Apply tone to the last vowel in pinyinBuffer
const applyToneToBuffer = (tone: 0 | 1 | 2 | 3 | 4) => {
  selectedTone.value = tone;

  // If tone is 0 (neutral) or buffer is empty, just update selectedTone
  if (tone === 0 || !pinyinBuffer.value) {
    return;
  }

  const buffer = pinyinBuffer.value;
  const vowels = ["a", "e", "i", "o", "u", "v", "ü"];
  const tonedVowels = Object.keys(tonedVowelToBase);

  // Find the last vowel position in the buffer
  let lastVowelIndex = -1;
  let lastVowelChar = "";

  for (let i = buffer.length - 1; i >= 0; i--) {
    const char = buffer[i].toLowerCase();
    // Check if it's a base vowel
    if (vowels.includes(char)) {
      lastVowelIndex = i;
      lastVowelChar = char === "ü" ? "v" : char;
      break;
    }
    // Check if it's already a toned vowel
    if (tonedVowels.includes(buffer[i])) {
      lastVowelIndex = i;
      lastVowelChar = tonedVowelToBase[buffer[i]];
      break;
    }
  }

  // If no vowel found, just keep the selectedTone for future input
  if (lastVowelIndex === -1) {
    return;
  }

  // Apply the tone to the vowel
  const tonedChar = pinyinTones[lastVowelChar][tone];
  pinyinBuffer.value =
    buffer.substring(0, lastVowelIndex) +
    tonedChar +
    buffer.substring(lastVowelIndex + 1);

  // Update candidates
  updateHanziCandidates();
};

const useKeyboardText = () => {
  // Include any pending pinyin buffer
  if (pinyinBuffer.value) {
    keyboardInputText.value += pinyinBuffer.value;
    pinyinBuffer.value = "";
    hanziCandidates.value = [];
    selectedTone.value = 0; // Reset tone
  }
  if (keyboardInputText.value.trim()) {
    wordText.value = keyboardInputText.value.trim();
  }
};

// Initialize canvas
const initCanvas = () => {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const container = canvas.parentElement;

  if (!container) return;

  // Set canvas size to match container
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Set initial background
  fillBackground();

  // Save initial state
  saveToHistory();
};

const fillBackground = () => {
  if (!ctx || !canvasRef.value) return;

  if (canvasBackground.value === "white") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  } else {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
};

// Drawing functions
const getPointerPos = (e: MouseEvent | Touch) => {
  if (!canvasRef.value) return { x: 0, y: 0 };

  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
};

const startDrawing = (e: MouseEvent) => {
  isDrawing.value = true;
  const pos = getPointerPos(e);

  if (!ctx) return;

  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  ctx.lineWidth = brushSize.value;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (currentTool.value === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = brushColor.value;
  }
};

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx) return;

  const pos = getPointerPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  hasDrawn.value = true;
  updatePreview();
};

const stopDrawing = () => {
  if (isDrawing.value && ctx) {
    ctx.closePath();
    saveToHistory();
  }
  isDrawing.value = false;
};

// Touch handlers
const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  startDrawing(mouseEvent);
};

const handleTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  draw(mouseEvent);
};

// History management
const saveToHistory = () => {
  if (!ctx || !canvasRef.value) return;

  // Remove any redo states
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1);
  }

  const imageData = ctx.getImageData(
    0,
    0,
    canvasRef.value.width,
    canvasRef.value.height
  );
  history.value.push(imageData);
  historyIndex.value = history.value.length - 1;

  // Limit history size
  if (history.value.length > 50) {
    history.value.shift();
    historyIndex.value--;
  }
};

const undoLast = () => {
  if (historyIndex.value <= 0 || !ctx) return;

  historyIndex.value--;
  ctx.putImageData(history.value[historyIndex.value], 0, 0);
  updatePreview();

  // Check if canvas is empty
  hasDrawn.value = historyIndex.value > 0;
};

const redoLast = () => {
  if (historyIndex.value >= history.value.length - 1 || !ctx) return;

  historyIndex.value++;
  ctx.putImageData(history.value[historyIndex.value], 0, 0);
  updatePreview();
  hasDrawn.value = true;
};

const clearCanvas = () => {
  if (!ctx || !canvasRef.value) return;

  fillBackground();
  hasDrawn.value = false;
  saveToHistory();
  updatePreview();
};

const updatePreview = () => {
  if (!canvasRef.value) return;
  previewDataUrl.value = canvasRef.value.toDataURL("image/png");
};

// Computed to check if can confirm
const canConfirm = computed(() => {
  if (inputMode.value === "draw") {
    return hasDrawn.value && wordText.value.trim().length > 0;
  } else {
    return wordText.value.trim().length > 0;
  }
});

const confirm = () => {
  if (!canConfirm.value) return;

  if (inputMode.value === "draw") {
    if (!canvasRef.value) return;
    const dataUrl = canvasRef.value.toDataURL("image/png");
    emit("confirm", { imageDataUrl: dataUrl, word: wordText.value.trim() });
  } else {
    // Keyboard mode - emit with empty imageDataUrl
    emit("confirm", { imageDataUrl: "", word: wordText.value.trim() });
  }
  close();
};

// OCR recognition function
const recognizeText = async () => {
  if (!canvasRef.value || !hasDrawn.value || isRecognizing.value) return;

  isRecognizing.value = true;

  try {
    const dataUrl = canvasRef.value.toDataURL("image/png");

    const worker = await createWorker(ocrLanguage.value);
    const { data } = await worker.recognize(dataUrl);
    await worker.terminate();

    if (data.text && data.text.trim()) {
      // Clean up the recognized text (remove extra whitespace, newlines)
      wordText.value = data.text.trim().replace(/\s+/g, " ");
    }
  } catch (error) {
    console.error("OCR recognition failed:", error);
  } finally {
    isRecognizing.value = false;
  }
};

const close = () => {
  emit("close");
};

// Reset state when modal opens
watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      // Reset drawing state
      hasDrawn.value = false;
      history.value = [];
      historyIndex.value = -1;
      previewDataUrl.value = "";
      wordText.value = props.word || "";

      // Reset keyboard state
      inputMode.value = "draw";
      keyboardInputText.value = "";
      isShift.value = false;
      selectedTone.value = 0;
      pinyinBuffer.value = "";
      hanziCandidates.value = [];

      await nextTick();
      initCanvas();
    }
  }
);

// Watch background changes
watch(canvasBackground, () => {
  if (!ctx || !canvasRef.value || !hasDrawn.value) {
    fillBackground();
    saveToHistory();
    return;
  }

  // Save current drawing
  const currentImage = ctx.getImageData(
    0,
    0,
    canvasRef.value.width,
    canvasRef.value.height
  );

  // Fill background
  fillBackground();

  // Restore drawing
  ctx.putImageData(currentImage, 0, 0);
  updatePreview();
});

// Handle resize
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    if (props.visible && canvasRef.value) {
      // Save current state before resize
      const currentState = ctx?.getImageData(
        0,
        0,
        canvasRef.value.width,
        canvasRef.value.height
      );

      initCanvas();

      // Restore state after resize if possible
      if (currentState && ctx) {
        ctx.putImageData(currentState, 0, 0);
      }
    }
  });
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
/* Custom range slider */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--tw-gradient-from),
    var(--tw-gradient-to)
  );
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Select dropdown dark mode styling */
:is(.dark) select option {
  background-color: #262626;
  color: #ffffff;
}

select option {
  background-color: #ffffff;
  color: #111827;
  padding: 8px 12px;
}

select option:checked {
  background: linear-gradient(135deg, #10b981, #14b8a6);
  color: white;
}

select option:hover {
  background-color: #10b981;
  color: white;
}

/* Virtual Keyboard Styles */
.keyboard-container {
  max-width: 600px;
  margin: 0 auto;
}

.keyboard-key {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 36px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
}

.keyboard-key:active {
  transform: scale(0.95);
  box-shadow: none;
}

/* Normal key (English) */
.keyboard-key-normal {
  background: linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%);
  color: #111827;
}

.keyboard-key-normal:hover {
  background: linear-gradient(180deg, #f9fafb 0%, #e5e7eb 100%);
}

:is(.dark) .keyboard-key-normal {
  background: linear-gradient(180deg, #3f3f46 0%, #27272a 100%);
  color: #f4f4f5;
  border-color: rgba(255, 255, 255, 0.1);
}

:is(.dark) .keyboard-key-normal:hover {
  background: linear-gradient(180deg, #52525b 0%, #3f3f46 100%);
}

/* Vowel key (Chinese) - highlighted in red/orange */
.keyboard-key-vowel {
  background: linear-gradient(180deg, #fef2f2 0%, #fecaca 100%);
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.2);
}

.keyboard-key-vowel:hover {
  background: linear-gradient(180deg, #fee2e2 0%, #fca5a5 100%);
}

:is(.dark) .keyboard-key-vowel {
  background: linear-gradient(
    180deg,
    rgba(220, 38, 38, 0.3) 0%,
    rgba(220, 38, 38, 0.2) 100%
  );
  color: #fca5a5;
  border-color: rgba(220, 38, 38, 0.3);
}

:is(.dark) .keyboard-key-vowel:hover {
  background: linear-gradient(
    180deg,
    rgba(220, 38, 38, 0.4) 0%,
    rgba(220, 38, 38, 0.3) 100%
  );
}

/* Consonant key (Chinese) - normal style with subtle blue */
.keyboard-key-consonant {
  background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0369a1;
  border-color: rgba(3, 105, 161, 0.2);
}

.keyboard-key-consonant:hover {
  background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%);
}

:is(.dark) .keyboard-key-consonant {
  background: linear-gradient(
    180deg,
    rgba(14, 165, 233, 0.2) 0%,
    rgba(14, 165, 233, 0.1) 100%
  );
  color: #7dd3fc;
  border-color: rgba(14, 165, 233, 0.2);
}

:is(.dark) .keyboard-key-consonant:hover {
  background: linear-gradient(
    180deg,
    rgba(14, 165, 233, 0.3) 0%,
    rgba(14, 165, 233, 0.2) 100%
  );
}

/* Special keys (backspace, space) */
.keyboard-key-special {
  background: linear-gradient(180deg, #e5e7eb 0%, #d1d5db 100%);
  color: #4b5563;
  border-color: rgba(0, 0, 0, 0.15);
}

.keyboard-key-special:hover {
  background: linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%);
}

:is(.dark) .keyboard-key-special {
  background: linear-gradient(180deg, #52525b 0%, #3f3f46 100%);
  color: #a1a1aa;
  border-color: rgba(255, 255, 255, 0.15);
}

:is(.dark) .keyboard-key-special:hover {
  background: linear-gradient(180deg, #71717a 0%, #52525b 100%);
}

/* Space key */
.keyboard-key-space {
  flex: 1;
  max-width: 250px;
  min-width: 150px;
}

/* Backspace key */
.keyboard-key-backspace {
  background: linear-gradient(180deg, #fef2f2 0%, #fecaca 100%);
  color: #dc2626;
  min-width: 50px;
}

.keyboard-key-backspace:hover {
  background: linear-gradient(180deg, #fee2e2 0%, #fca5a5 100%);
}

:is(.dark) .keyboard-key-backspace {
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.3) 0%,
    rgba(239, 68, 68, 0.2) 100%
  );
  color: #fca5a5;
}

:is(.dark) .keyboard-key-backspace:hover {
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.4) 0%,
    rgba(239, 68, 68, 0.3) 100%
  );
}

/* Toned vowels quick access */
.keyboard-key-toned {
  min-width: 30px;
  height: 32px;
  padding: 0 6px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(180deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border-color: rgba(217, 119, 6, 0.3);
}

.keyboard-key-toned:hover {
  background: linear-gradient(180deg, #fde68a 0%, #fcd34d 100%);
  transform: scale(1.1);
}

:is(.dark) .keyboard-key-toned {
  background: linear-gradient(
    180deg,
    rgba(251, 191, 36, 0.3) 0%,
    rgba(251, 191, 36, 0.2) 100%
  );
  color: #fcd34d;
  border-color: rgba(251, 191, 36, 0.3);
}

:is(.dark) .keyboard-key-toned:hover {
  background: linear-gradient(
    180deg,
    rgba(251, 191, 36, 0.4) 0%,
    rgba(251, 191, 36, 0.3) 100%
  );
}

/* Chinese font */
.font-chinese {
  font-family: "Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif;
}
</style>
