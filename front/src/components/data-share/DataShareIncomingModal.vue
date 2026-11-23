<template>
  <Teleport to="body">
    <Transition name="share-fade">
      <div
        v-if="current"
        class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-3 sm:p-4"
      >
        <div
          class="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full border border-black/5 dark:border-white/10 overflow-hidden"
          role="alertdialog"
          aria-modal="true"
          :aria-label="t('dataShare.incoming.title')"
        >
          <div class="p-5 sm:p-6 flex items-start gap-4">
            <div
              class="w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div class="min-w-0">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ t("dataShare.incoming.title") }}
              </h2>
              <p class="mt-2 text-sm text-gray-700 dark:text-gray-300 break-words">
                {{
                  t("dataShare.incoming.message", {
                    name: senderName,
                    email: current.sender.email,
                    words: current.vocabularyCount,
                    histories: current.historyCount,
                  })
                }}
              </p>
              <p
                v-if="extrasText"
                class="mt-2 text-sm text-gray-700 dark:text-gray-300 break-words"
              >
                {{ t("dataShare.incoming.extras", { list: extrasText }) }}
              </p>
              <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {{ t("dataShare.incoming.note") }}
              </p>
              <p
                v-if="queue.length > 1"
                class="mt-3 text-xs font-semibold text-primary-600 dark:text-primary-400"
              >
                {{ t("dataShare.incoming.more", { count: queue.length - 1 }) }}
              </p>
            </div>
          </div>

          <div class="px-5 sm:px-6 pb-5 sm:pb-6 flex gap-3">
            <button
              type="button"
              class="flex-1 py-3 px-4 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="busy"
              @click="answer('reject')"
            >
              {{ t("dataShare.incoming.reject") }}
            </button>
            <button
              type="button"
              class="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 shadow-lg shadow-primary-500/30 transition disabled:opacity-70 disabled:cursor-not-allowed"
              :disabled="busy"
              @click="answer('accept')"
            >
              <span v-if="!busy">{{ t("dataShare.incoming.accept") }}</span>
              <span v-else class="flex items-center justify-center gap-2">
                <span
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                {{ t("dataShare.incoming.working") }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth.store";
import { useToast } from "../../composables/useToast";
import { useModalScrollLock } from "../../composables/useModalScrollLock";
import { websocketService } from "../../services/websocket.service";
import {
  dataShareService,
  describeMergeExtras,
  describeSummary,
  isShareGone,
  registerDataShareMessages,
  shareErrorMessage,
  type IncomingShare,
  type ShareMergeStats,
} from "./dataShare.service";

const { t, te, mergeLocaleMessage } = useI18n();
registerDataShareMessages(mergeLocaleMessage);

const authStore = useAuthStore();
const { showSuccess, showInfo, showError } = useToast();
const { lockScroll, unlockScroll } = useModalScrollLock();

const queue = ref<IncomingShare[]>([]);
const busy = ref(false);
const current = computed(() => queue.value[0] ?? null);
const extrasText = computed(() => describeSummary(current.value?.summary, t as any));
const senderName = computed(
  () =>
    current.value?.sender.fullName ||
    current.value?.sender.email ||
    t("dataShare.incoming.unknownSender"),
);

watch(current, (value, previous) => {
  if (value && !previous) lockScroll();
  else if (!value && previous) unlockScroll();
});

function enqueue(share: IncomingShare) {
  if (!share?.id || queue.value.some((item) => item.id === share.id)) return;
  queue.value = [...queue.value, share];
}

function dequeue(id: string) {
  queue.value = queue.value.filter((item) => item.id !== id);
}

async function refresh() {
  if (!authStore.isAuthenticated || busy.value) return;
  try {
    const incoming = await dataShareService.getIncoming();
    // The server list is the truth: this also drops offers the sender cancelled
    // while this tab could not receive the realtime event.
    queue.value = incoming;
  } catch {
    /* keep the current queue; the next refresh will try again */
  }
}

// Realtime handlers -------------------------------------------------------
const onReceived = (data: IncomingShare) => enqueue(data);
const onCancelled = (data: { id: string }) => dequeue(data?.id);
const onResponded = (data: {
  status: "accepted" | "rejected";
  recipient?: { fullName?: string; email?: string };
  stats?: ShareMergeStats;
}) => {
  const name = data.recipient?.fullName || data.recipient?.email || "";
  if (data.status === "accepted") {
    showSuccess(
      t("dataShare.responded.accepted", {
        name,
        new: data.stats?.newVocabularies ?? 0,
      }),
      6000,
    );
  } else {
    showInfo(t("dataShare.responded.rejected", { name }), 6000);
  }
};

function bindRealtime() {
  websocketService.on("data-share:received", onReceived);
  websocketService.on("data-share:cancelled", onCancelled);
  websocketService.on("data-share:responded", onResponded);
}

function unbindRealtime() {
  websocketService.off("data-share:received", onReceived);
  websocketService.off("data-share:cancelled", onCancelled);
  websocketService.off("data-share:responded", onResponded);
}

// The websocket service clears every listener when it disconnects (logout), so
// bind again whenever someone signs in.
watch(
  () => authStore.token,
  (token) => {
    unbindRealtime();
    if (token) {
      bindRealtime();
      void refresh();
    } else {
      queue.value = [];
    }
  },
);

// Offers sent while this tab was offline or the socket was down are picked up
// when the person returns to the tab and on a slow timer.
const onVisible = () => {
  if (document.visibilityState === "visible") void refresh();
};
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  if (authStore.isAuthenticated) {
    bindRealtime();
    void refresh();
  }
  document.addEventListener("visibilitychange", onVisible);
  timer = setInterval(() => void refresh(), 60_000);
});

onBeforeUnmount(() => {
  unbindRealtime();
  document.removeEventListener("visibilitychange", onVisible);
  if (timer) clearInterval(timer);
});

async function answer(action: "accept" | "reject") {
  const share = current.value;
  if (!share || busy.value) return;
  busy.value = true;
  try {
    if (action === "accept") {
      const result = await dataShareService.accept(share.id);
      const extras = describeMergeExtras(result.stats, t as any);
      showSuccess(
        t(extras ? "dataShare.result.acceptedMore" : "dataShare.result.accepted", {
          new: result.stats?.newVocabularies ?? 0,
          skipped: result.stats?.skippedVocabularies ?? 0,
          extras,
        }),
        8000,
      );
    } else {
      await dataShareService.reject(share.id);
      showInfo(t("dataShare.result.rejected"));
    }
    dequeue(share.id);
  } catch (e: any) {
    showError(shareErrorMessage(e, t as any, te as any), 5000);
    if (isShareGone(e)) dequeue(share.id);
  } finally {
    busy.value = false;
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
