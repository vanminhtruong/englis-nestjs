<template>
  <div class="space-y-4">
    <HistoryItem
      v-for="history in histories"
      :key="history.id"
      :history="history"
      :format-time="formatTime"
      :format-date="formatDate"
      :is-selected="selectedIds.has(history.id)"
      @delete-history="$emit('delete-history', $event)"
      @toggle-selection="$emit('toggle-selection', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import type { History } from "../interface";

const HistoryItem = defineAsyncComponent(
  () => import("./HistoryItem.vue") as any
);

defineProps<{
  histories: History[];
  formatTime: (seconds: number) => string;
  formatDate: (date: string) => string;
  selectedIds: Set<string>;
}>();

defineEmits<{
  "delete-history": [historyId: string];
  "toggle-selection": [historyId: string];
}>();
</script>

<script lang="ts">
export default {
  name: "HistoryList",
};
</script>
