<template>
  <Teleport to="body">
    <Transition name="share-fade">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-3 sm:p-4"
      >
        <div
          data-seasonal-dialog class="bg-white dark:bg-black rounded-3xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-white/10 overflow-hidden"
          role="dialog"
          aria-modal="true"
          :aria-label="t('dataShare.modal.title')"
        >
          <div
            class="p-5 sm:p-6 border-b border-black/5 dark:border-white/10 flex items-start justify-between gap-4"
          >
            <h2
              class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-purple-400"
            >
              {{ t("dataShare.modal.title") }}
            </h2>
            <button
              type="button"
              class="p-2 -mr-2 -mt-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 transition"
              :disabled="sending"
              @click="close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form class="p-5 sm:p-6 space-y-4" @submit.prevent="submit">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t("dataShare.modal.description") }}
            </p>

            <div>
              <label
                for="share-email"
                class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                {{ t("dataShare.modal.emailLabel") }}
              </label>
              <input
                id="share-email"
                ref="emailInput"
                v-model="email"
                type="email"
                inputmode="email"
                autocomplete="off"
                maxlength="254"
                :placeholder="t('dataShare.modal.emailPlaceholder')"
                :disabled="sending"
                class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition"
                :class="
                  error
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-200 dark:border-white/10'
                "
                @input="error = ''"
              />
              <p v-if="error" class="mt-1.5 text-sm text-red-500" role="alert">
                {{ error }}
              </p>
            </div>

            <p
              class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-xl px-3 py-2.5"
            >
              {{ t("dataShare.modal.note") }}
            </p>

            <div class="flex gap-3 pt-1">
              <button
                type="submit"
                class="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 shadow-lg shadow-primary-500/30 transition disabled:opacity-70 disabled:cursor-not-allowed"
                :disabled="sending || !email.trim()"
              >
                <span v-if="!sending">{{ t("dataShare.modal.send") }}</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <span
                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  ></span>
                  {{ t("dataShare.modal.sending") }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useModalScrollLock } from "../../composables/useModalScrollLock";
import { useToast } from "../../composables/useToast";
import {
  dataShareService,
  registerDataShareMessages,
  shareErrorMessage,
} from "./dataShare.service";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const { t, te, mergeLocaleMessage } = useI18n();
registerDataShareMessages(mergeLocaleMessage);

const { showSuccess } = useToast();
const { lockScroll, unlockScroll } = useModalScrollLock();

const email = ref("");
const error = ref("");
const sending = ref(false);
const emailInput = ref<HTMLInputElement | null>(null);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

watch(
  () => props.show,
  async (open) => {
    if (open) {
      email.value = "";
      error.value = "";
      lockScroll();
      await nextTick();
      emailInput.value?.focus();
    } else {
      unlockScroll();
    }
  },
);

function close() {
  if (sending.value) return;
  emit("close");
}

async function submit() {
  if (sending.value) return;
  const value = email.value.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(value)) {
    error.value = t("dataShare.invalidEmail");
    return;
  }

  sending.value = true;
  error.value = "";
  try {
    const result = await dataShareService.send(value);
    showSuccess(t("dataShare.sent", { email: result.recipientEmail || value }), 5000);
    emit("close");
  } catch (e: any) {
    error.value = shareErrorMessage(e, t as any, te as any);
  } finally {
    sending.value = false;
  }
}
</script>

<style scoped>
.share-fade-enter-active,
.share-fade-leave-active {
  transition: opacity 0.25s ease;
}
.share-fade-enter-from,
.share-fade-leave-to {
  opacity: 0;
}
</style>
