<template>
  <div>
    <button
      @click="isOpen = true"
      class="p-2 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all relative group"
      :title="note ? t('vocabulary.note.edit') : t('vocabulary.note.add')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        :class="{ 'fill-yellow-100 dark:fill-yellow-900/30': note }"
      >
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        ></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <span
        v-if="note"
        class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
      ></span>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div
          class="relative w-full max-w-md transform transition-all duration-300 scale-100 rotate-1 bg-[#fef3c7] dark:bg-black border dark:border-white/10 shadow-2xl rounded-sm p-6"
          style="box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2)"
        >
          <!-- Tape effect -->
          <div
            class="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/30 backdrop-blur-md transform -rotate-2 shadow-sm border border-white/20"
          ></div>

          <h3
            class="text-xl font-handwriting font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2"
          >
            <span class="text-2xl">📝</span>
            {{ t("vocabulary.note.title", { word }) }}
          </h3>

          <textarea
            v-model="localNote"
            :placeholder="t('vocabulary.note.placeholder')"
            class="w-full h-48 bg-transparent border-none resize-none focus:ring-0 text-gray-800 dark:text-gray-200 text-lg font-handwriting leading-[2rem] bg-[length:100%_2rem] bg-[linear-gradient(transparent_95%,rgba(0,0,0,0.2)_95%)] dark:bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.2)_95%)]"
          ></textarea>

          <div class="flex justify-end gap-3 mt-4">
            <button
              @click="close"
              class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              {{ t("vocabulary.cancel") }}
            </button>
            <button
              @click="save"
              class="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg shadow-lg hover:transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
              :disabled="isUpdating"
            >
              <span v-if="isUpdating" class="animate-spin">⌛</span>
              {{ t("vocabulary.note.save") }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useVocabularyNoteHandle } from "../composable/manager-handle/useVocabularyNoteHandle";

export default defineComponent({
  name: "VocabularyNote",
  props: {
    id: {
      type: String,
      required: true,
    },
    word: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
  },
  emits: ["update"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const isOpen = ref(false);
    const localNote = ref(props.note || "");
    const { updateNote, isUpdating } = useVocabularyNoteHandle();

    watch(
      () => props.note,
      (newVal) => {
        localNote.value = newVal || "";
      }
    );

    const close = () => {
      isOpen.value = false;
      localNote.value = props.note || "";
    };

    const save = async () => {
      const result = await updateNote(props.id, localNote.value);
      if (result.success) {
        emit("update", localNote.value);
        isOpen.value = false;
      }
    };

    return {
      t,
      isOpen,
      localNote,
      isUpdating,
      close,
      save,
    };
  },
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap");

.font-handwriting {
  font-family: "Kalam", cursive;
}
</style>
