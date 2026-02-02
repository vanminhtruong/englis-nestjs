<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
      >
        <Transition name="modal-scale" appear>
          <div
            v-if="show"
            class="bg-white/90 dark:bg-zinc-900/95 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col backdrop-blur-xl border border-white/20 dark:border-white/10 overflow-hidden transform"
          >
            <!-- Header -->
            <div
              class="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-white/50 dark:bg-black/20"
            >
              <h2
                class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-purple-400"
              >
                {{ t("profile.editProfile") || "Edit Profile" }}
              </h2>
              <button
                type="button"
                @click="emit('close')"
                class="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 active:scale-95 duration-200"
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-0 overflow-y-auto custom-scrollbar flex-1 relative">
              <ProfileForm :form="form" :t="t" />
            </div>

            <!-- Footer -->
            <div
              class="p-6 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-zinc-900/50 flex gap-4"
            >
              <button
                type="button"
                class="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200 active:scale-98"
                @click="emit('close')"
              >
                {{ t("profile.actions.cancel") }}
              </button>
              <button
                type="button"
                class="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transform hover:-translate-y-0.5 transition-all duration-200 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                :disabled="saving"
                @click="emit('submit')"
              >
                <span
                  v-if="!saving"
                  class="flex items-center justify-center gap-2"
                >
                  {{ t("profile.actions.saveChanges") }}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                    ></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                </span>
                <div v-else class="flex items-center justify-center gap-2">
                  <div
                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  ></div>
                  <span>{{ t("common.loading") }}</span>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useModalScrollLock } from "../../../composables/useModalScrollLock";
import { watch } from "vue";

const ProfileForm = defineAsyncComponent(
  () => import("./ProfileForm.vue") as any
);

const props = defineProps<{
  show: boolean;
  form: any;
  saving: boolean;
  t: (key: string) => string;
}>();

const emit = defineEmits<{
  (e: "submit"): void;
  (e: "close"): void;
}>();

const { lockScroll, unlockScroll } = useModalScrollLock();

watch(
  () => props.show,
  (val) => {
    if (val) lockScroll();
    else unlockScroll();
  }
);
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Custom Scrollbar for a premium look */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.8);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4);
}
</style>
